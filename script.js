const switchButtons = document.querySelectorAll("[data-screen-target]");
const screens = document.querySelectorAll("[data-screen]");
const liveTimeNodes = document.querySelectorAll("[data-live-time]");
const homePanels = document.querySelectorAll("[data-panel]");
const navItems = document.querySelectorAll("[data-panel-target]");
const profileButton = document.getElementById("profileButton");
const earnButton = document.getElementById("earnButton");
const swapButton = document.getElementById("swapButton");
const cadInput = document.getElementById("cadInput");
const thbInput = document.getElementById("thbInput");
const feeValue = document.getElementById("feeValue");
const rateCopy = document.getElementById("rateCopy");
const rateMeta = document.getElementById("rateMeta");
const refreshRateButton = document.getElementById("refreshRateButton");
const exchangePreviewValue = document.getElementById("exchangePreviewValue");
const arrivalValue = document.getElementById("arrivalValue");
const sendButton = document.getElementById("sendButton");
const paymentsSendButton = document.getElementById("paymentsSendButton");
const balanceTotal = document.getElementById("balanceTotal");
const cashBalanceValue = document.getElementById("cashBalanceValue");
const cashDetailsButton = document.getElementById("cashDetailsButton");
const backButton = document.getElementById("backButton");
const seeAllButton = document.getElementById("seeAllButton");
const extraTransactions = document.querySelectorAll("[data-extra-transaction]");
const transactionItems = document.querySelectorAll(".transaction-item");
const alertsButton = document.getElementById("alertsButton");
const promoCard = document.getElementById("promoCard");
const promoCloseButton = document.getElementById("promoCloseButton");
const promoArrowButton = document.getElementById("promoArrowButton");
const feedbackButton = document.getElementById("feedbackButton");
const feedbackModal = document.getElementById("feedbackModal");
const closeModalButton = document.getElementById("closeModalButton");
const submitFeedbackButton = document.getElementById("submitFeedbackButton");
const feedbackInput = document.getElementById("feedbackInput");
const toast = document.getElementById("toast");
const fromCurrencyButton = document.getElementById("fromCurrencyButton");
const toCurrencyButton = document.getElementById("toCurrencyButton");
const fromCurrencyLabel = document.getElementById("fromCurrencyLabel");
const toCurrencyLabel = document.getElementById("toCurrencyLabel");
const currencyModal = document.getElementById("currencyModal");
const closeCurrencyModalButton = document.getElementById("closeCurrencyModalButton");
const currencyOptionGrid = document.getElementById("currencyOptionGrid");
const currencyOptionButtons = document.querySelectorAll("[data-currency-option]");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const recipientList = document.getElementById("recipientList");
const recipientName = document.getElementById("recipientName");
const recipientMethod = document.getElementById("recipientMethod");
const recipientCurrency = document.getElementById("recipientCurrency");
const paymentRecipientName = document.getElementById("paymentRecipientName");
const paymentRecipientMeta = document.getElementById("paymentRecipientMeta");
const payRecipientButton = document.getElementById("payRecipientButton");
const toggleRecipientFormButton = document.getElementById("toggleRecipientFormButton");
const recipientForm = document.getElementById("recipientForm");
const recipientNameInput = document.getElementById("recipientNameInput");
const recipientMethodInput = document.getElementById("recipientMethodInput");
const recipientCurrencyInput = document.getElementById("recipientCurrencyInput");

const CURRENCY_META = {
  THB: { flagClass: "flag-th", markup: "" },
  USD: { flagClass: "flag-us", markup: "" },
  EUR: { flagClass: "flag-eur", markup: "" },
  GBP: { flagClass: "flag-gbp", markup: "" },
  JPY: { flagClass: "flag-jpy", markup: "" },
  AUD: { flagClass: "flag-aud", markup: "" },
};

function getFlagMarkup(countryCode) {
  if (countryCode === "CA") {
    return '<span class="flag-leaf"></span>';
  }

  return "";
}

function getCurrencyMeta(code) {
  return CURRENCY_META[code] ?? { flagClass: "flag-eur", markup: "" };
}

function applyFlag(node, currencyCode) {
  const meta = getCurrencyMeta(currencyCode);
  node.className = `flag ${meta.flagClass}`;
  node.innerHTML = meta.markup;
}

function getRecipientRows() {
  return document.querySelectorAll(".recipient-row");
}

function renderRecipientSelection() {
  const { name, method, currency } = appState.selectedRecipient;
  recipientName.textContent = name;
  recipientMethod.textContent = method;
  recipientCurrency.textContent = currency;
  paymentRecipientName.textContent = name;
  paymentRecipientMeta.textContent = `${method} · ${currency}`;
}

function selectRecipient(button) {
  appState.selectedRecipient = {
    name: button.dataset.recipientName,
    method: button.dataset.recipientMethod,
    currency: button.dataset.recipientCurrency,
  };

  getRecipientRows().forEach((row) => {
    row.classList.toggle("is-selected", row === button);
  });

  renderRecipientSelection();
}

const FEE_RATE = 0.0083857143;
const MIN_FEE = 1.75;

const appState = {
  activeScreen: "home",
  activePanel: "home",
  swapped: false,
  alertsEnabled: false,
  expandedTransactions: false,
  balance: 133710.28,
  exchangeRate: 33,
  lastRateUpdated: null,
  rateLoading: false,
  fromCurrency: "USD",
  toCurrency: "THB",
  selectedRecipient: {
    name: "Matthew Powell",
    method: "Bank transfer",
    currency: "THB",
  },
};

let toastTimer = null;
let clockTimer = null;
let activeCurrencyRole = "from";

function updateLiveClock() {
  const now = new Date();
  const timeText = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  liveTimeNodes.forEach((node) => {
    node.textContent = timeText;
  });
}

function formatMoney(value, currency, decimals = 2) {
  return `${Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
}

function downloadCashPdf() {
  const link = document.createElement("a");
  link.href = encodeURI("Statement.pdf");
  link.download = "Statement.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast("PDF downloaded.");
}

function formatRate(value) {
  return Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

function updateRateDisplay(message) {
  rateCopy.textContent = `1 ${appState.fromCurrency} = ${formatRate(appState.exchangeRate)} ${appState.toCurrency}`;
  exchangePreviewValue.textContent = `1 ${appState.fromCurrency} = ${formatRate(appState.exchangeRate)} ${appState.toCurrency}`;

  if (message) {
    rateMeta.textContent = message;
    return;
  }

  if (!appState.lastRateUpdated) {
    rateMeta.textContent = "Using fallback rate.";
    return;
  }

  rateMeta.textContent = `Live rate updated ${appState.lastRateUpdated.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}.`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function setActiveScreen(name) {
  appState.activeScreen = name;

  switchButtons.forEach((button) => {
    const isActive = button.dataset.screenTarget === name;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
}

function setActivePanel(name) {
  appState.activePanel = name;

  navItems.forEach((item) => {
    item.classList.toggle("is-current", item.dataset.panelTarget === name);
  });

  homePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === name);
  });
}

function updateBalances() {
  const formatted = formatMoney(appState.balance, "USD");
  balanceTotal.textContent = formatted;
  cashBalanceValue.textContent = formatted;
}

function syncFromSource(source = "cad") {
  const fromRaw = Number(cadInput.value) || 0;
  const toRaw = Number(thbInput.value) || 0;
  let fromValue = fromRaw;
  let toValue = toRaw;

  if (source === "cad") {
    toValue = fromValue * appState.exchangeRate;
  } else {
    fromValue = toValue / appState.exchangeRate;
  }

  cadInput.value = fromValue ? fromValue.toFixed(2).replace(/\.00$/, "") : "0";
  thbInput.value = toValue ? toValue.toFixed(2).replace(/\.00$/, "") : "0";

  const feeBase = fromValue;
  const fee = Math.max(MIN_FEE, feeBase * FEE_RATE);
  feeValue.textContent = formatMoney(fee, appState.fromCurrency);
  arrivalValue.textContent = feeBase > 10000 ? "Today" : "In seconds";
}

function swapCurrencies() {
  const currentAmount = cadInput.value;
  const currentConverted = thbInput.value;
  const currentFrom = appState.fromCurrency;
  const currentTo = appState.toCurrency;

  appState.fromCurrency = currentTo;
  appState.toCurrency = currentFrom;
  cadInput.value = currentConverted;
  thbInput.value = currentAmount;
  updateCurrencyUI();
  fetchExchangeRate(false);
}

function updateCurrencyUI() {
  fromCurrencyLabel.textContent = appState.fromCurrency;
  toCurrencyLabel.textContent = appState.toCurrency;
  applyFlag(fromFlag, appState.fromCurrency);
  applyFlag(toFlag, appState.toCurrency);
}

function openCurrencyModal(role) {
  activeCurrencyRole = role;
  currencyModal.classList.add("is-open");
  currencyModal.setAttribute("aria-hidden", "false");

  currencyOptionButtons.forEach((button) => {
    const code = button.dataset.currencyOption;
    const blockedCode = role === "from" ? appState.toCurrency : appState.fromCurrency;
    button.classList.toggle("is-disabled", code === blockedCode);
  });
}

function closeCurrencyModal() {
  currencyModal.classList.remove("is-open");
  currencyModal.setAttribute("aria-hidden", "true");
}

function chooseCurrency(code) {
  if ((activeCurrencyRole === "from" && code === appState.toCurrency) || (activeCurrencyRole === "to" && code === appState.fromCurrency)) {
    showToast("Choose two different currencies.");
    return;
  }

  if (activeCurrencyRole === "from") {
    appState.fromCurrency = code;
  } else {
    appState.toCurrency = code;
  }

  updateCurrencyUI();
  updateRateDisplay("Fetching latest exchange rate...");
  closeCurrencyModal();
  fetchExchangeRate(false);
}

async function fetchExchangeRate(showNotifications = true) {
  if (appState.rateLoading) {
    return;
  }

  appState.rateLoading = true;
  refreshRateButton.disabled = true;
  rateMeta.textContent = "Fetching latest exchange rate...";

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${appState.fromCurrency}&to=${appState.toCurrency}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const nextRate = Number(data?.rates?.[appState.toCurrency]);

    if (!Number.isFinite(nextRate) || nextRate <= 0) {
      throw new Error("Invalid rate payload");
    }

    appState.exchangeRate = nextRate;
    appState.lastRateUpdated = new Date();
    updateRateDisplay();
    syncFromSource("cad");
    if (showNotifications) {
      showToast(`Live ${appState.fromCurrency}/${appState.toCurrency} rate updated.`);
    }
  } catch (error) {
    updateRateDisplay("Could not fetch live rate. Using fallback rate.");
    if (showNotifications) {
      showToast("Live rate unavailable. Fallback rate is active.");
    }
  } finally {
    appState.rateLoading = false;
    refreshRateButton.disabled = false;
  }
}

function appendTransferTransaction(sourceAmount, destinationAmount) {
  const transactionList = document.querySelector(".transactions");
  const sectionHeading = transactionList.querySelector(".section-heading");
  const article = document.createElement("article");
  article.className = "transaction-row transaction-item";
  article.dataset.transaction = `New transfer|Sent just now|${destinationAmount}`;
  article.innerHTML = `
    <div class="row-icon outline">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 12h10M7 12l4-4M7 12l4 4M17 12l-4-4M17 12l-4 4" />
      </svg>
    </div>
    <div class="row-copy">
      <h3>New transfer</h3>
      <p>Sent just now · ${sourceAmount}</p>
    </div>
    <div class="row-meta">
      <strong>${destinationAmount}</strong>
    </div>
  `;

  sectionHeading.insertAdjacentElement("afterend", article);
  article.addEventListener("click", handleTransactionClick);
}

function sendTransfer() {
  const sourceValue = Number(cadInput.value) || 0;
  const destinationValue = Number(thbInput.value) || 0;

  if (sourceValue <= 0 || destinationValue <= 0) {
    showToast("Enter an amount greater than zero.");
    return;
  }

  const debit = appState.swapped ? destinationValue : sourceValue;
  if (debit > appState.balance) {
    showToast("Not enough USD balance for this transfer.");
    return;
  }

  appState.balance -= debit;
  updateBalances();

  const sourceCurrency = appState.fromCurrency;
  const destinationCurrency = appState.toCurrency;

  appendTransferTransaction(
    formatMoney(sourceValue, sourceCurrency),
    formatMoney(destinationValue, destinationCurrency)
  );

  showToast(`Transfer created for ${appState.selectedRecipient.name}.`);
  setActivePanel("home");
  setActiveScreen("home");
}

function toggleTransactions() {
  appState.expandedTransactions = !appState.expandedTransactions;
  seeAllButton.setAttribute("aria-expanded", String(appState.expandedTransactions));
  seeAllButton.textContent = appState.expandedTransactions ? "Show less" : "See all";

  extraTransactions.forEach((item) => {
    item.classList.toggle("is-hidden", !appState.expandedTransactions);
  });
}

function toggleAlerts() {
  appState.alertsEnabled = !appState.alertsEnabled;
  alertsButton.classList.toggle("is-on", appState.alertsEnabled);
  alertsButton.setAttribute("aria-pressed", String(appState.alertsEnabled));
  showToast(appState.alertsEnabled ? "Exchange rate alerts enabled." : "Exchange rate alerts paused.");
}

function openModal() {
  feedbackModal.classList.add("is-open");
  feedbackModal.setAttribute("aria-hidden", "false");
  feedbackInput.focus();
}

function closeModal() {
  feedbackModal.classList.remove("is-open");
  feedbackModal.setAttribute("aria-hidden", "true");
}

function submitFeedback() {
  const value = feedbackInput.value.trim();
  if (!value) {
    showToast("Write a short message first.");
    return;
  }

  feedbackInput.value = "";
  closeModal();
  showToast("Feedback sent. Thank you.");
}

function handleTransactionClick(event) {
  const item = event.currentTarget;
  const [title, subtitle, amount] = item.dataset.transaction.split("|");
  showToast(`${title}: ${subtitle} · ${amount}`);
}

function toggleRecipientForm() {
  recipientForm.classList.toggle("is-hidden");
}

function addRecipient(event) {
  event.preventDefault();

  const name = recipientNameInput.value.trim();
  const method = recipientMethodInput.value;
  const currency = recipientCurrencyInput.value;

  if (!name) {
    showToast("Enter a recipient name.");
    return;
  }

  const button = document.createElement("button");
  button.className = "mini-list-row recipient-row";
  button.type = "button";
  button.dataset.recipientName = name;
  button.dataset.recipientMethod = method;
  button.dataset.recipientCurrency = currency;
  button.innerHTML = `<strong>${name}</strong><span>${method}</span>`;
  button.addEventListener("click", () => selectRecipient(button));
  recipientList.appendChild(button);

  selectRecipient(button);
  recipientForm.reset();
  recipientForm.classList.add("is-hidden");
  showToast(`Recipient ${name} added.`);
}

switchButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveScreen(button.dataset.screenTarget));
});

navItems.forEach((item) => {
  item.addEventListener("click", () => setActivePanel(item.dataset.panelTarget));
});

transactionItems.forEach((item) => {
  item.addEventListener("click", handleTransactionClick);
});

getRecipientRows().forEach((row) => {
  row.addEventListener("click", () => selectRecipient(row));
});

profileButton?.addEventListener("click", () => setActiveScreen("balance"));
earnButton?.addEventListener("click", () => showToast("Referral flow opened."));
cadInput?.addEventListener("input", () => syncFromSource("cad"));
thbInput?.addEventListener("input", () => syncFromSource("thb"));
fromCurrencyButton?.addEventListener("click", () => openCurrencyModal("from"));
toCurrencyButton?.addEventListener("click", () => openCurrencyModal("to"));
closeCurrencyModalButton?.addEventListener("click", closeCurrencyModal);
currencyOptionGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-currency-option]");
  if (!button) {
    return;
  }

  chooseCurrency(button.dataset.currencyOption);
});
swapButton?.addEventListener("click", swapCurrencies);
refreshRateButton?.addEventListener("click", fetchExchangeRate);
sendButton?.addEventListener("click", sendTransfer);
paymentsSendButton?.addEventListener("click", () => {
  setActivePanel("home");
  document.querySelector(".calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
payRecipientButton?.addEventListener("click", () => {
  setActivePanel("payments");
  showToast(`Preparing payment for ${appState.selectedRecipient.name}.`);
});
toggleRecipientFormButton?.addEventListener("click", toggleRecipientForm);
recipientForm?.addEventListener("submit", addRecipient);
cashDetailsButton?.addEventListener("click", downloadCashPdf);
backButton?.addEventListener("click", () => setActiveScreen("home"));
seeAllButton?.addEventListener("click", toggleTransactions);
alertsButton?.addEventListener("click", toggleAlerts);
promoCloseButton?.addEventListener("click", () => {
  promoCard.classList.add("is-hidden");
  showToast("Promo hidden.");
});
promoArrowButton?.addEventListener("click", () => showToast("Invoice upload flow opened."));
feedbackButton?.addEventListener("click", openModal);
closeModalButton?.addEventListener("click", closeModal);
submitFeedbackButton?.addEventListener("click", submitFeedback);
feedbackModal?.addEventListener("click", (event) => {
  if (event.target === feedbackModal) {
    closeModal();
  }
});
currencyModal?.addEventListener("click", (event) => {
  if (event.target === currencyModal) {
    closeCurrencyModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && feedbackModal.classList.contains("is-open")) {
    closeModal();
  }
  if (event.key === "Escape" && currencyModal.classList.contains("is-open")) {
    closeCurrencyModal();
  }
});

updateBalances();
setActivePanel("home");
renderRecipientSelection();
updateCurrencyUI();
updateRateDisplay("Fetching latest exchange rate...");
syncFromSource("cad");
updateLiveClock();
fetchExchangeRate();

if (clockTimer) {
  window.clearInterval(clockTimer);
}

clockTimer = window.setInterval(updateLiveClock, 1000);
