const VEHICLE_STORAGE_KEY = "camp-vehicle-page-state";
const vehicleState = loadVehicleState();

function setVehicleStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

function escapeVehicleHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureVehicleAppsScript(statusElement) {
  if (!window.CAMP_BACKEND || !window.CAMP_BACKEND.hasAppsScriptEndpoint()) {
    setVehicleStatus(statusElement, "Apps Script 저장 URL이 연결되지 않았습니다.", "error");
    return false;
  }

  return true;
}

function toVehiclePositiveInteger(value, fallbackValue) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackValue;
  }

  return Math.floor(parsed);
}

function loadVehicleState() {
  try {
    const stored = window.localStorage.getItem(VEHICLE_STORAGE_KEY);
    if (!stored) {
      return { riders: [], vehicles: [], assignments: [] };
    }

    const parsed = JSON.parse(stored);
    return {
      riders: Array.isArray(parsed.riders) ? parsed.riders : [],
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    };
  } catch (error) {
    return { riders: [], vehicles: [], assignments: [] };
  }
}

function persistVehicleState() {
  try {
    window.localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicleState));
  } catch (error) {
    // Keep working in memory if localStorage is blocked.
  }
}

function buildVehicleAssignments(riders, vehicles) {
  const normalizedVehicles = vehicles.map((vehicle) => ({
    vehicleName: vehicle.vehicleName,
    driver: vehicle.driver,
    capacity: toVehiclePositiveInteger(vehicle.capacity, 1),
    from: vehicle.from,
    to: vehicle.to,
    notes: vehicle.notes,
    passengers: [],
    passengerNotes: [],
  }));

  riders.forEach((rider) => {
    const preferredVehicle =
      normalizedVehicles.find(
        (vehicle) =>
          vehicle.passengers.length < vehicle.capacity &&
          (rider.from ? vehicle.from === rider.from : true) &&
          (rider.to ? vehicle.to === rider.to : true),
      ) || normalizedVehicles.find((vehicle) => vehicle.passengers.length < vehicle.capacity);

    if (!preferredVehicle) {
      return;
    }

    preferredVehicle.passengers.push(rider.name);

    if (rider.notes) {
      preferredVehicle.passengerNotes.push(`${rider.name}: ${rider.notes}`);
    }
  });

  return normalizedVehicles.map((vehicle) => {
    const noteParts = [];
    if (vehicle.notes) {
      noteParts.push(vehicle.notes);
    }
    if (vehicle.passengerNotes.length > 0) {
      noteParts.push(`탑승 메모 - ${vehicle.passengerNotes.join(" / ")}`);
    }

    return {
      vehicleName: vehicle.vehicleName,
      driver: vehicle.driver,
      passengers: vehicle.passengers,
      from: vehicle.from,
      to: vehicle.to,
      notes: noteParts.join(" | "),
      capacity: vehicle.capacity,
      passengerCount: vehicle.passengers.length,
    };
  });
}

function buildVehiclePayload(assignments) {
  return {
    type: "vehicle_assignment",
    rows: assignments.map((assignment) => ({
      vehicleName: assignment.vehicleName,
      driver: assignment.driver,
      passengers: assignment.passengers,
      from: assignment.from,
      to: assignment.to,
      notes: assignment.notes,
    })),
  };
}

function renderVehicleState() {
  renderVehicleRiders();
  renderVehicleCars();
  renderVehicleAssignments();
}

function renderVehicleRiders() {
  const container = document.querySelector("#vehicle-rider-list");
  const empty = document.querySelector("#vehicle-rider-empty");
  const count = document.querySelector("#vehicle-rider-count");

  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${vehicleState.riders.length}명`;
  }

  if (vehicleState.riders.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = vehicleState.riders
    .map(
      (rider, index) => `
        <details class="tool-item tool-collapse-item">
          <summary class="tool-collapse-summary vehicle-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeVehicleHtml(rider.name)}</strong>
              <span class="vehicle-route-preview">${escapeVehicleHtml(rider.from || "출발지 미정")} → ${escapeVehicleHtml(rider.to || "도착지 미정")}</span>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <p>${escapeVehicleHtml(rider.from || "출발지 미정")} → ${escapeVehicleHtml(rider.to || "도착지 미정")}</p>
            <span>${escapeVehicleHtml(rider.notes || "추가 메모 없음")}</span>
            <div class="tool-inline-actions">
              <button type="button" class="list-remove-button" data-kind="rider" data-index="${index}">삭제</button>
            </div>
          </div>
        </details>
      `,
    )
    .join("");
}

function renderVehicleCars() {
  const container = document.querySelector("#vehicle-car-list");
  const empty = document.querySelector("#vehicle-car-empty");
  const count = document.querySelector("#vehicle-car-count");

  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${vehicleState.vehicles.length}대`;
  }

  if (vehicleState.vehicles.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = vehicleState.vehicles
    .map(
      (vehicle, index) => `
        <details class="tool-item tool-collapse-item">
          <summary class="tool-collapse-summary vehicle-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeVehicleHtml(vehicle.vehicleName)}</strong>
              <div class="tool-collapse-chips">
                <span class="summary-chip">${escapeVehicleHtml(vehicle.capacity)}명</span>
                <span class="mini-meta">${escapeVehicleHtml(vehicle.driver || "운전자 미정")}</span>
              </div>
              <span class="vehicle-route-preview">${escapeVehicleHtml(vehicle.from || "출발지 미정")} → ${escapeVehicleHtml(vehicle.to || "도착지 미정")}</span>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <p>운전자: ${escapeVehicleHtml(vehicle.driver || "미정")} · 정원 ${escapeVehicleHtml(vehicle.capacity)}명</p>
            <span>${escapeVehicleHtml(vehicle.from || "출발지 미정")} → ${escapeVehicleHtml(vehicle.to || "도착지 미정")}</span>
            <span>${escapeVehicleHtml(vehicle.notes || "추가 메모 없음")}</span>
            <div class="tool-inline-actions">
              <button type="button" class="list-remove-button" data-kind="vehicle" data-index="${index}">삭제</button>
            </div>
          </div>
        </details>
      `,
    )
    .join("");
}

function renderVehicleAssignments() {
  const container = document.querySelector("#vehicle-result-list");
  const empty = document.querySelector("#vehicle-result-empty");
  const count = document.querySelector("#vehicle-result-count");

  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${vehicleState.assignments.length}대`;
  }

  if (vehicleState.assignments.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = vehicleState.assignments
    .map(
      (assignment) => `
        <details class="tool-item tool-collapse-item">
          <summary class="tool-collapse-summary vehicle-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeVehicleHtml(assignment.vehicleName)}</strong>
              <div class="tool-collapse-chips">
                <span class="summary-chip">${assignment.passengerCount}/${assignment.capacity}명 탑승</span>
                <span class="mini-meta">${escapeVehicleHtml(assignment.driver || "운전자 미정")}</span>
              </div>
              <span class="vehicle-route-preview">${escapeVehicleHtml(assignment.from || "출발지 미정")} → ${escapeVehicleHtml(assignment.to || "도착지 미정")}</span>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <p>운전자: ${escapeVehicleHtml(assignment.driver || "미정")}</p>
            <p class="assignment-route">${escapeVehicleHtml(assignment.from || "출발지 미정")} → ${escapeVehicleHtml(assignment.to || "도착지 미정")}</p>
            <div class="team-member-list">
              ${
                assignment.passengers.length > 0
                  ? assignment.passengers.map((name) => `<span class="member-pill">${escapeVehicleHtml(name)}</span>`).join("")
                  : '<span class="member-pill muted">배치된 탑승자 없음</span>'
              }
            </div>
            <span>${escapeVehicleHtml(assignment.notes || "추가 메모 없음")}</span>
          </div>
        </details>
      `,
    )
    .join("");
}

function handleVehicleListClick(event) {
  const button = event.target.closest(".list-remove-button");
  if (!button) {
    return;
  }

  const kind = button.getAttribute("data-kind");
  const index = Number(button.getAttribute("data-index"));

  if (kind === "rider") {
    vehicleState.riders.splice(index, 1);
  }

  if (kind === "vehicle") {
    vehicleState.vehicles.splice(index, 1);
  }

  vehicleState.assignments = [];
  renderVehicleState();
  persistVehicleState();
}

function submitVehicleRider(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#vehicle-rider-status");

  vehicleState.riders.push({
    name: String(formData.get("name") || "").trim(),
    from: String(formData.get("from") || "").trim(),
    to: String(formData.get("to") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  });

  vehicleState.assignments = [];
  renderVehicleState();
  persistVehicleState();
  form.reset();
  setVehicleStatus(status, "탑승자를 목록에 추가했습니다. 배치 결과를 다시 생성해 주세요.", "ok");
}

function submitVehicleCar(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#vehicle-car-status");

  vehicleState.vehicles.push({
    vehicleName: String(formData.get("vehicleName") || "").trim(),
    driver: String(formData.get("driver") || "").trim(),
    capacity: toVehiclePositiveInteger(formData.get("capacity"), 1),
    from: String(formData.get("from") || "").trim(),
    to: String(formData.get("to") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  });

  vehicleState.assignments = [];
  renderVehicleState();
  persistVehicleState();
  form.reset();
  form.elements.capacity.value = "8";
  setVehicleStatus(status, "차량을 목록에 추가했습니다. 배치 결과를 다시 생성해 주세요.", "ok");
}

function generateVehicleAssignments() {
  const status = document.querySelector("#vehicle-save-status");

  if (vehicleState.riders.length === 0) {
    setVehicleStatus(status, "먼저 탑승자를 한 명 이상 추가해 주세요.", "error");
    return;
  }

  if (vehicleState.vehicles.length === 0) {
    setVehicleStatus(status, "먼저 차량을 한 대 이상 추가해 주세요.", "error");
    return;
  }

  vehicleState.assignments = buildVehicleAssignments(vehicleState.riders, vehicleState.vehicles);
  renderVehicleAssignments();
  persistVehicleState();

  const assignedCount = vehicleState.assignments.reduce((total, item) => total + item.passengerCount, 0);
  const missingCount = Math.max(vehicleState.riders.length - assignedCount, 0);
  const message =
    missingCount === 0
      ? "차량 배치 결과를 생성했습니다."
      : `차량 정원이 부족하여 ${missingCount}명의 탑승자가 아직 배치되지 않았습니다.`;
  setVehicleStatus(status, message, missingCount === 0 ? "ok" : "pending");
}

async function saveVehicleAssignments() {
  const status = document.querySelector("#vehicle-save-status");

  if (!ensureVehicleAppsScript(status)) {
    return;
  }

  if (vehicleState.assignments.length === 0) {
    setVehicleStatus(status, "배치 결과를 먼저 생성한 뒤 저장해 주세요.", "error");
    return;
  }

  setVehicleStatus(status, "차량 배치 결과를 저장 중입니다...", "pending");

  try {
    await window.CAMP_BACKEND.postToAppsScript(buildVehiclePayload(vehicleState.assignments));
    setVehicleStatus(status, "차량 배치 저장 요청을 보냈습니다. `차량배치` 탭에서 반영 여부를 확인해 주세요.", "ok");
  } catch (error) {
    setVehicleStatus(status, "저장 요청에 실패했습니다. Apps Script 웹앱 설정을 다시 확인해 주세요.", "error");
  }
}

function resetVehicleAssignments() {
  const status = document.querySelector("#vehicle-save-status");
  vehicleState.assignments = [];
  renderVehicleAssignments();
  persistVehicleState();
  setVehicleStatus(status, "배치 결과를 초기화했습니다.", "pending");
}

function clearVehiclePage() {
  const status = document.querySelector("#vehicle-save-status");
  vehicleState.riders = [];
  vehicleState.vehicles = [];
  vehicleState.assignments = [];
  renderVehicleState();
  persistVehicleState();
  setVehicleStatus(status, "탑승자, 차량, 배치 결과를 모두 비웠습니다.", "pending");
}

const vehicleRiderForm = document.querySelector("#vehicle-rider-form");
if (vehicleRiderForm) {
  vehicleRiderForm.addEventListener("submit", submitVehicleRider);
}

const vehicleCarForm = document.querySelector("#vehicle-car-form");
if (vehicleCarForm) {
  vehicleCarForm.addEventListener("submit", submitVehicleCar);
}

const vehicleRiderList = document.querySelector("#vehicle-rider-list");
if (vehicleRiderList) {
  vehicleRiderList.addEventListener("click", handleVehicleListClick);
}

const vehicleCarList = document.querySelector("#vehicle-car-list");
if (vehicleCarList) {
  vehicleCarList.addEventListener("click", handleVehicleListClick);
}

const vehicleGenerateButton = document.querySelector("#vehicle-generate-button");
if (vehicleGenerateButton) {
  vehicleGenerateButton.addEventListener("click", generateVehicleAssignments);
}

const vehicleSaveButton = document.querySelector("#vehicle-save-button");
if (vehicleSaveButton) {
  vehicleSaveButton.addEventListener("click", saveVehicleAssignments);
}

const vehicleResetButton = document.querySelector("#vehicle-reset-button");
if (vehicleResetButton) {
  vehicleResetButton.addEventListener("click", resetVehicleAssignments);
}

const vehicleClearButton = document.querySelector("#vehicle-clear-button");
if (vehicleClearButton) {
  vehicleClearButton.addEventListener("click", clearVehiclePage);
}

window.VEHICLE_PAGE = {
  buildVehicleAssignments,
  buildVehiclePayload,
};

renderVehicleState();
