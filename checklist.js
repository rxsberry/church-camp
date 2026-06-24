const CHECKLIST_STORAGE_KEY = "camp-checklist-page-state";
const checklistItems = loadChecklistItems();

function setChecklistStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

function escapeChecklistHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureChecklistAppsScript(statusElement) {
  if (!window.CAMP_BACKEND || !window.CAMP_BACKEND.hasAppsScriptEndpoint()) {
    setChecklistStatus(statusElement, "Apps Script 저장 URL이 연결되지 않았습니다.", "error");
    return false;
  }

  return true;
}

function loadChecklistItems() {
  try {
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistChecklistItems() {
  try {
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistItems));
  } catch (error) {
    // Keep working in memory if localStorage is blocked.
  }
}

function buildChecklistPayload(items) {
  return {
    type: "checklist",
    rows: items.map((item) => ({
      category: item.category,
      item: item.item,
      status: item.status,
      owner: item.owner,
      notes: item.notes,
    })),
  };
}

function renderChecklist() {
  const container = document.querySelector("#checklist-groups");
  const empty = document.querySelector("#checklist-empty");
  const count = document.querySelector("#checklist-total-count");

  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${checklistItems.length}개`;
  }

  if (checklistItems.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  const categories = ["개인", "조별", "공용"];
  container.innerHTML = categories
    .map((category) => {
      const items = checklistItems.filter((item) => item.category === category);
      if (items.length === 0) {
        return "";
      }

      return `
        <details class="tool-group-box tool-collapse-item">
          <summary class="tool-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeChecklistHtml(category)}</strong>
              <div class="tool-collapse-chips">
                <span class="summary-chip">${items.length}개</span>
              </div>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <div class="tool-list">
              ${items
                .map((item) => {
                  const index = checklistItems.indexOf(item);
                  return `
                    <details class="tool-item tool-collapse-item">
                      <summary class="tool-collapse-summary">
                        <div class="tool-collapse-main">
                          <strong>${escapeChecklistHtml(item.item)}</strong>
                          <div class="tool-collapse-chips">
                            <span class="summary-chip">${escapeChecklistHtml(item.status)}</span>
                          </div>
                        </div>
                        <span class="tool-collapse-toggle">자세히 보기</span>
                      </summary>
                      <div class="tool-collapse-body">
                        <label class="check-row">
                          <input type="checkbox" data-toggle-index="${index}" ${item.status === "준비 완료" ? "checked" : ""} />
                          <span>${escapeChecklistHtml(item.status)}</span>
                        </label>
                        <p>담당자: ${escapeChecklistHtml(item.owner || "미정")}</p>
                        <span>${escapeChecklistHtml(item.notes || "추가 메모 없음")}</span>
                        <div class="tool-inline-actions">
                          <button type="button" class="list-remove-button" data-index="${index}">삭제</button>
                        </div>
                      </div>
                    </details>
                  `;
                })
                .join("")}
            </div>
          </div>
        </details>
      `;
    })
    .join("");
}

function submitChecklistItem(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#checklist-entry-status");

  checklistItems.push({
    category: String(formData.get("category") || "").trim(),
    item: String(formData.get("item") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    status: "준비 전",
  });

  renderChecklist();
  persistChecklistItems();
  form.reset();
  setChecklistStatus(status, "준비물 항목을 추가했습니다. 필요하면 오른쪽에서 체크 상태를 바꿔 주세요.", "ok");
}

function handleChecklistClick(event) {
  const removeButton = event.target.closest(".list-remove-button");
  if (removeButton) {
    const index = Number(removeButton.getAttribute("data-index"));
    checklistItems.splice(index, 1);
    renderChecklist();
    persistChecklistItems();
    return;
  }

  const toggle = event.target.closest("[data-toggle-index]");
  if (!toggle) {
    return;
  }

  const index = Number(toggle.getAttribute("data-toggle-index"));
  checklistItems[index].status = toggle.checked ? "준비 완료" : "준비 전";
  renderChecklist();
  persistChecklistItems();
}

async function saveChecklistItems() {
  const status = document.querySelector("#checklist-save-status");

  if (!ensureChecklistAppsScript(status)) {
    return;
  }

  if (checklistItems.length === 0) {
    setChecklistStatus(status, "먼저 저장할 준비물 항목을 추가해 주세요.", "error");
    return;
  }

  setChecklistStatus(status, "준비물 체크리스트를 저장 중입니다...", "pending");

  try {
    await window.CAMP_BACKEND.postToAppsScript(buildChecklistPayload(checklistItems));
    setChecklistStatus(status, "체크리스트 저장 요청을 보냈습니다. `준비물체크` 탭에서 반영 여부를 확인해 주세요.", "ok");
  } catch (error) {
    setChecklistStatus(status, "저장 요청에 실패했습니다. Apps Script 웹앱 설정을 다시 확인해 주세요.", "error");
  }
}

function clearChecklistItems() {
  const status = document.querySelector("#checklist-save-status");
  checklistItems.splice(0, checklistItems.length);
  renderChecklist();
  persistChecklistItems();
  setChecklistStatus(status, "준비물 목록을 비웠습니다.", "pending");
}

const checklistEntryForm = document.querySelector("#checklist-entry-form");
if (checklistEntryForm) {
  checklistEntryForm.addEventListener("submit", submitChecklistItem);
}

const checklistGroups = document.querySelector("#checklist-groups");
if (checklistGroups) {
  checklistGroups.addEventListener("click", handleChecklistClick);
}

const checklistSaveButton = document.querySelector("#checklist-save-button");
if (checklistSaveButton) {
  checklistSaveButton.addEventListener("click", saveChecklistItems);
}

const checklistClearButton = document.querySelector("#checklist-clear-button");
if (checklistClearButton) {
  checklistClearButton.addEventListener("click", clearChecklistItems);
}

window.CHECKLIST_PAGE = {
  buildChecklistPayload,
};

renderChecklist();
