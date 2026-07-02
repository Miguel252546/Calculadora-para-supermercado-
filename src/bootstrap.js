// src/bootstrap.js
// Punto único de entrada. Ensambla dependencias y arranca la app en DOMContentLoaded.
// Regla: ningún archivo por dentro del bootstrap debe acceder a localStorage o DOM
// directamente, salvo a través de los gateways y UI services.

import { makeLocalStorageCartRepository }       from './frameworks/gateways/LocalStorageCartRepository.js';
import { makeLocalStorageHistoryRepository }    from './frameworks/gateways/LocalStorageHistoryRepository.js';
import { makeLocalStoragePrelistRepository }    from './frameworks/gateways/LocalStoragePrelistRepository.js';
import { makeLocalStoragePendingRepository }    from './frameworks/gateways/LocalStoragePendingRepository.js';
import { makeLocalStorageSettingsRepository }   from './frameworks/gateways/LocalStorageSettingsRepository.js';

import { makeAddProductToCart }       from './usecases/AddProductToCart.js';
import { makeRemoveProductFromCart }  from './usecases/RemoveProductFromCart.js';
import { makeUpdateProductInCart }    from './usecases/UpdateProductInCart.js';
import { makeCalculateCartTotal }     from './usecases/CalculateCartTotal.js';
import { makeClearCart }              from './usecases/ClearCart.js';
import { makeGenerateInvoice }        from './usecases/GenerateInvoice.js';
import { makeManagePrelist }          from './usecases/ManagePrelist.js';
import { makeManagePending }          from './usecases/ManagePending.js';
import { makeManageHistory }          from './usecases/ManageHistory.js';
import { makeSelectPrelistItem }      from './usecases/SelectPrelistItem.js';
import { makeCompletePendingProduct } from './usecases/CompletePendingProduct.js';

import { makeThemeManager }  from './frameworks/ui/ThemeManager.js';
import { makePrintService }  from './frameworks/ui/PrintService.js';
import { makeImageInput }    from './frameworks/ui/ImageInput.js';
import { makeTabs }          from './frameworks/ui/Tabs.js';
import { makeCartTabs }      from './frameworks/ui/CartTabs.js';
import { seedDefaultPrelist } from './frameworks/ui/DefaultPrelistSeeder.js';

import { CartPresenter }    from './interface_adapters/presenters/CartPresenter.js';
import { HistoryPresenter } from './interface_adapters/presenters/HistoryPresenter.js';

import { makeCartController }    from './interface_adapters/controllers/CartController.js';
import { makeThemeController }   from './interface_adapters/controllers/ThemeController.js';
import { makePrelistController } from './interface_adapters/controllers/PrelistController.js';
import { makePendingController } from './interface_adapters/controllers/PendingController.js';
import { makeHistoryController } from './interface_adapters/controllers/HistoryController.js';

import { $ } from './frameworks/ui/DomBinder.js';

function bootstrap() {
  // 1) Gateways (infra)
  const cartRepository     = makeLocalStorageCartRepository();
  const historyRepository  = makeLocalStorageHistoryRepository();
  const prelistRepository  = makeLocalStoragePrelistRepository();
  const pendingRepository  = makeLocalStoragePendingRepository();
  const settingsRepository = makeLocalStorageSettingsRepository();

  // 2) UI services (frameworks)
  const themeManager = makeThemeManager({ settingsRepository });
  const printService = makePrintService();
  const imageInput   = makeImageInput();
  const tabs         = makeTabs();
  const cartTabs     = makeCartTabs();

  // 3) Seed inicial: si la prelista está vacía, cargar defaults.
  seedDefaultPrelist(prelistRepository);

  // 4) UseCases
  const addProduct     = makeAddProductToCart({ cartRepository });
  const removeProduct  = makeRemoveProductFromCart({ cartRepository });
  const updateProduct  = makeUpdateProductInCart({ cartRepository });
  const calculateTotal = makeCalculateCartTotal({ cartRepository });
  const clearCart      = makeClearCart({ cartRepository });
  const generateInvoice = makeGenerateInvoice({ cartRepository, historyRepository, settingsRepository, printService });
  const managePrelist   = makeManagePrelist({ prelistRepository });
  const managePending   = makeManagePending({ pendingRepository });
  const manageHistory   = makeManageHistory({ historyRepository });
  const selectPrelistItem = makeSelectPrelistItem({ cartRepository, settingsRepository });
  const completePendingProduct = makeCompletePendingProduct({ cartRepository, pendingRepository });

  // 5) Controllers (interface adapters)
  const cartController = makeCartController({
    addProduct, removeProduct, updateProduct, calculateTotal, clearCart, generateInvoice, clearPrelist: managePrelist.clear, imageInput
  });
  const themeController   = makeThemeController({ themeManager });
  const prelistController = makePrelistController({ managePrelist, settingsRepository, selectPrelistItem });
  const pendingController = makePendingController({ managePending, completePendingProduct });
  const historyController = makeHistoryController({ manageHistory, printService, settingsRepository });

  // 6) Render centralizado (single source of truth)
  function renderAll() {
    // Carrito: lista + total + badge + imagen
    const vm = cartController.viewModel();
    $('products-list').innerHTML = CartPresenter.renderListHtml(vm);
    $('total-amount').textContent = vm.total;
    // Badge pestaña principal
    const badge = $('badge-cart');
    if (badge) {
      if (vm.count > 0) {
        badge.textContent = String(vm.itemCount ?? vm.count);
        badge.removeAttribute('hidden');
      } else {
        badge.setAttribute('hidden', '');
      }
    }
    // Badge sub-pestaña Carrito
    const innerBadge = $('badge-cart-inner');
    if (innerBadge) {
      if (vm.count > 0) {
        innerBadge.textContent = String(vm.itemCount ?? vm.count);
        innerBadge.removeAttribute('hidden');
      } else {
        innerBadge.setAttribute('hidden', '');
      }
    }
    // Badge sub-pestaña Pendientes
    const pendingItems = managePending.list();
    const pendingBadge = $('badge-pending-inner');
    if (pendingBadge) {
      if (pendingItems.length > 0) {
        pendingBadge.textContent = String(pendingItems.length);
        pendingBadge.removeAttribute('hidden');
      } else {
        pendingBadge.setAttribute('hidden', '');
      }
    }
    // Historial
    const hOut = HistoryPresenter.renderListHtml(manageHistory.list());
    const hList = $('history-list');
    if (hList) hList.innerHTML = hOut.html;
  }

  // 7) Cross-controller wiring (evita TDZ creando los controllers primero).
  pendingController.subscribe(() => {
    pendingController.render();
    renderAll();
  });
  historyController.subscribe(() => {
    historyController.render();
    renderAll();
  });
  cartController.subscribe(renderAll);
  prelistController.subscribe(renderAll);

  // 8) Servicios UI
  tabs.init();
  cartTabs.init();
  imageInput.init();
  themeController.attach();
  cartController.attach();
  prelistController.attach();
  pendingController.attach();
  historyController.attach();

  // 9) Render inicial
  renderAll();
  prelistController.render();
  pendingController.render();
  historyController.render();
}

document.addEventListener('DOMContentLoaded', bootstrap);
