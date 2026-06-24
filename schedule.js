const scheduleEntries = [];

function setScheduleStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

function renderScheduleEntries() {
  const container = document.querySelector("#schedule-items");
  const empty = document.querySelector("#schedule-empty");

  if (!container || !empty) {
    return;
  }

  if (scheduleEntries.length === 0) {
    empty.style.display = "block";
    container.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = scheduleEntries
    .map(
      (entry, index) => `
        <article class="schedule-item">
          <div class="schedule-item-head">
            <strong>${entry.title}</strong>
            <button type="button" class="schedule-remove-button" data-index="${index}">삭제</button>
          </div>
          <p>${entry.content}</p>
          <span>담당자: ${entry.owner}</span>
        </article>
      `,
    )
    .join("");

  container.querySelectorAll(".schedule-remove-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-index"));
      scheduleEntries.splice(index, 1);
      renderScheduleEntries();
    });
  });
}

function handleScheduleEntrySubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#schedule-entry-status");

  scheduleEntries.push({
    title: String(formData.get("title") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
  });

  renderScheduleEntries();
  form.reset();
  setScheduleStatus(status, "일정 항목이 목록에 추가되었습니다. 저장 버튼으로 스프레드시트에 보낼 수 있습니다.", "ok");
}

async function saveScheduleEntries() {
  const status = document.querySelector("#schedule-save-status");

  if (!window.CAMP_BACKEND || !window.CAMP_BACKEND.hasAppsScriptEndpoint()) {
    setScheduleStatus(status, "Apps Script 저장 URL이 연결되지 않았습니다.", "error");
    return;
  }

  if (scheduleEntries.length === 0) {
    setScheduleStatus(status, "먼저 저장할 일정 항목을 하나 이상 추가해 주세요.", "error");
    return;
  }

  setScheduleStatus(status, "일정 목록을 저장 중입니다...", "pending");

  try {
    await window.CAMP_BACKEND.postToAppsScript({
      type: "schedule_note",
      rows: scheduleEntries,
    });

    setScheduleStatus(
      status,
      "일정 목록 저장 요청을 보냈습니다. 스프레드시트의 `일정메모` 탭에서 반영 여부를 확인해 주세요.",
      "ok",
    );
  } catch (error) {
    setScheduleStatus(
      status,
      "저장 요청에 실패했습니다. Apps Script 웹앱 배포 권한과 Web App URL을 다시 확인해 주세요.",
      "error",
    );
  }
}

function clearScheduleEntries() {
  const status = document.querySelector("#schedule-save-status");
  scheduleEntries.splice(0, scheduleEntries.length);
  renderScheduleEntries();
  setScheduleStatus(status, "목록을 비웠습니다.", "pending");
}

const scheduleEntryForm = document.querySelector("#schedule-entry-form");
if (scheduleEntryForm) {
  scheduleEntryForm.addEventListener("submit", handleScheduleEntrySubmit);
}

const scheduleSaveButton = document.querySelector("#schedule-save-button");
if (scheduleSaveButton) {
  scheduleSaveButton.addEventListener("click", saveScheduleEntries);
}

const scheduleClearButton = document.querySelector("#schedule-clear-button");
if (scheduleClearButton) {
  scheduleClearButton.addEventListener("click", clearScheduleEntries);
}

renderScheduleEntries();
