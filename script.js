/* ===================================================================
   CONFIG — edit before publishing
=================================================================== */
const WHATSAPP_NUMBER = "919655880439"; // country code + number, no + or spaces
const OFFER_WINDOW_MINUTES = 60; // per-visitor countdown: minutes from first visit before price reverts

/* ===================================================================
   WhatsApp links
=================================================================== */
const waMessage = encodeURIComponent("Hi Arjun, ₹1 Crore roadmap pathi pesanum!");
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;
document.getElementById("whatsappCta").href = waLink;
document.getElementById("whatsappFloat").href = waLink;

/* ===================================================================
   Per-visitor 1-hour countdown
   - First visit: starts a 1-hour timer, stored in localStorage
   - Same visitor returns within the hour: timer continues from where it was
   - After the hour: shows 00:00:00, offer strip text can be swapped to ₹299
     manually if you set up a second Razorpay link for the regular price
=================================================================== */
const STORAGE_KEY = "afc_offer_deadline";

function getDeadline() {
  let deadline = localStorage.getItem(STORAGE_KEY);
  if (!deadline) {
    deadline = Date.now() + OFFER_WINDOW_MINUTES * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, deadline);
  }
  return parseInt(deadline, 10);
}

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function tickCountdown() {
  const deadline = getDeadline();
  const remaining = deadline - Date.now();
  const formatted = formatTime(remaining);
  const stripTimer = document.getElementById("stripTimer");
  const offerTimer = document.getElementById("offerTimer");
  if (stripTimer) stripTimer.textContent = formatted;
  if (offerTimer) offerTimer.textContent = formatted;

  if (remaining <= 0) {
    const strip = document.getElementById("urgencyStrip");
    if (strip) strip.querySelector(".urgency-strip__text").textContent = "⏳ Offer window closed for this visit — regular price ₹299 applies now.";
  }
}

tickCountdown();
setInterval(tickCountdown, 1000);

/* ===================================================================
   ₹1 Crore Calculator
   - Monthly investment steps up 10% every year (salary growth assumption)
   - Target of ₹1 Crore is inflation-adjusted at 6% per year (real purchasing power)
   - Assumed illustrative investment growth: 12% per annum, compounded monthly
     (clearly disclosed on-page as an assumption, not a guarantee)
=================================================================== */
function calculateYearsToCrore(monthlySavings) {
  const ASSUMED_ANNUAL_RETURN = 0.12;
  const ANNUAL_STEP_UP = 0.10;
  const ANNUAL_INFLATION = 0.06;
  const TARGET_TODAY = 10000000; // ₹1 Crore
  const MAX_YEARS = 50;

  const monthlyReturn = ASSUMED_ANNUAL_RETURN / 12;
  let corpus = 0;
  let monthlyInvestment = monthlySavings;

  for (let year = 1; year <= MAX_YEARS; year++) {
    for (let month = 1; month <= 12; month++) {
      corpus = corpus * (1 + monthlyReturn) + monthlyInvestment;
    }
    const targetThisYear = TARGET_TODAY * Math.pow(1 + ANNUAL_INFLATION, year);
    if (corpus >= targetThisYear) {
      return year;
    }
    monthlyInvestment = monthlyInvestment * (1 + ANNUAL_STEP_UP);
  }
  return null; // beyond MAX_YEARS
}

const calcButton = document.getElementById("calcButton");
if (calcButton) {
  calcButton.addEventListener("click", () => {
    const income = parseFloat(document.getElementById("calcIncome").value) || 0;
    const savings = parseFloat(document.getElementById("calcSavings").value) || 0;
    const age = parseInt(document.getElementById("calcAge").value, 10) || null;

    const resultBox = document.getElementById("calcResult");
    const yearsEl = document.getElementById("calcYears");
    const ageTextEl = document.getElementById("calcAgeText");

    if (savings <= 0) {
      resultBox.hidden = false;
      yearsEl.textContent = "--";
      ageTextEl.textContent = "Monthly savings amount podunga, calculate panna.";
      return;
    }

    const years = calculateYearsToCrore(savings);
    resultBox.hidden = false;

    if (years === null) {
      yearsEl.textContent = "50+";
      ageTextEl.textContent = "Indha savings rate-la 50 years-ku mela pidikkum. Amount increase pannina, years significantly reduce aagum — session-la eppadinu kaatren.";
    } else {
      yearsEl.textContent = years;
      if (age) {
        ageTextEl.textContent = `Andha vayasu approx: ${age + years}`;
      } else {
        ageTextEl.textContent = "";
      }
    }
  });
}
