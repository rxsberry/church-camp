const volunteerRoles = ["인솔", "찬양", "안전", "행정", "식사", "미디어"];
const VOLUNTEER_STORAGE_KEY = "camp-volunteers-page-state";
const volunteerRoster = loadVolunteerRoster();

function setVolunteerStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

function escapeVolunteerHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureVolunteerAppsScript(statusElement) {
  if (!window.CAMP_BACKEND || !window.CAMP_BACKEND.hasAppsScriptEndpoint()) {
    setVolunteerStatus(statusElement, "Apps Script 저장 URL이 연결되지 않았습니다.", "error");
    return false;
  }

  return true;
}

function loadVolunteerRoster() {
  try {
    const stored = window.localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistVolunteerRoster() {
  try {
    window.localStorage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(volunteerRoster));
  } catch (error) {
    // Keep working in memory if localStorage is blocked.
  }
}

function buildVolunteerPayload(volunteers) {
  return {
    type: "volunteer",
    rows: volunteers.map((volunteer) => {
      const detailNotes = [];
      if (volunteer.preferredRole) {
        detailNotes.push(`희망 역할: ${volunteer.preferredRole}`);
      }
      if (volunteer.unavailableRole) {
        detailNotes.push(`불가한 역할: ${volunteer.unavailableRole}`);
      }
      if (volunteer.notes) {
        detailNotes.push(volunteer.notes);
      }

      return {
        name: volunteer.name,
        role: volunteer.role,
        phone: volunteer.phone,
        notes: detailNotes.join(" | "),
      };
    }),
  };
}

function cloneVolunteer(volunteer) {
  return {
    name: volunteer.name,
    phone: volunteer.phone,
    preferredRole: volunteer.preferredRole || "",
    unavailableRole: volunteer.unavailableRole || "",
    role: volunteer.role || "",
    notes: volunteer.notes || "",
  };
}

function resetVolunteerAssignments() {
  volunteerRoster.forEach((volunteer) => {
    volunteer.role = "";
  });
}

function scoreVolunteerForRole(volunteer, role, currentCounts) {
  if (volunteer.unavailableRole && volunteer.unavailableRole === role) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 100;
  if (volunteer.preferredRole && volunteer.preferredRole === role) {
    score += 60;
  }

  score -= (currentCounts[role] || 0) * 15;
  return score;
}

function autoAssignVolunteerRoles(volunteers) {
  const assigned = volunteers.map(cloneVolunteer);
  const currentCounts = Object.fromEntries(volunteerRoles.map((role) => [role, 0]));

  assigned.sort((left, right) => {
    const leftHasPreference = left.preferredRole ? 1 : 0;
    const rightHasPreference = right.preferredRole ? 1 : 0;
    if (leftHasPreference !== rightHasPreference) {
      return rightHasPreference - leftHasPreference;
    }
    return left.name.localeCompare(right.name, "ko");
  });

  assigned.forEach((volunteer) => {
    let bestRole = "";
    let bestScore = Number.NEGATIVE_INFINITY;

    volunteerRoles.forEach((role) => {
      const score = scoreVolunteerForRole(volunteer, role, currentCounts);
      const isBetter = score > bestScore;
      const isTie = score === bestScore && bestRole && (currentCounts[role] || 0) < (currentCounts[bestRole] || 0);

      if (isBetter || isTie || !bestRole) {
        bestRole = role;
        bestScore = score;
      }
    });

    volunteer.role = bestRole;
    currentCounts[bestRole] = (currentCounts[bestRole] || 0) + 1;
  });

  return assigned;
}

function renderVolunteerRoster() {
  const container = document.querySelector("#volunteer-list");
  const empty = document.querySelector("#volunteer-empty");
  const summary = document.querySelector("#volunteer-summary-list");
  const count = document.querySelector("#volunteer-count");

  if (!container || !empty || !summary) {
    return;
  }

  if (count) {
    count.textContent = `${volunteerRoster.length}명`;
  }

  if (volunteerRoster.length === 0) {
    container.innerHTML = "";
    summary.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = volunteerRoster
    .map(
      (volunteer, index) => `
        <details class="tool-item volunteer-collapse-item">
          <summary class="volunteer-collapse-summary">
            <div class="volunteer-collapse-main">
              <strong>${escapeVolunteerHtml(volunteer.name)}</strong>
              <div class="volunteer-collapse-chips">
                <span class="summary-chip">${escapeVolunteerHtml(volunteer.role || "미배정")}</span>
                <span class="mini-meta">희망 ${escapeVolunteerHtml(volunteer.preferredRole || "없음")}</span>
                <span class="mini-meta">불가 ${escapeVolunteerHtml(volunteer.unavailableRole || "없음")}</span>
              </div>
            </div>
            <span class="volunteer-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="volunteer-collapse-body">
            <p>연락처: ${escapeVolunteerHtml(volunteer.phone || "미입력")}</p>
            <span>희망 역할: ${escapeVolunteerHtml(volunteer.preferredRole || "미선택")}</span>
            <span>불가한 역할: ${escapeVolunteerHtml(volunteer.unavailableRole || "없음")}</span>
            <span>AI 배정 결과: ${escapeVolunteerHtml(volunteer.role || "아직 생성되지 않음")}</span>
            <span>${escapeVolunteerHtml(volunteer.notes || "특이사항 없음")}</span>
            <div class="tool-inline-actions volunteer-collapse-actions">
              <button type="button" class="list-remove-button" data-index="${index}">삭제</button>
            </div>
          </div>
        </details>
      `,
    )
    .join("");

  const roleCounts = volunteerRoles.map((role) => ({
    role,
    count: volunteerRoster.filter((volunteer) => volunteer.role === role).length,
  }));

  summary.innerHTML = roleCounts
    .map(
      (item) => `
        <article class="tool-summary-box">
          <strong>${escapeVolunteerHtml(item.role)}</strong>
          <span class="summary-chip">${item.count}명</span>
        </article>
      `,
    )
    .join("");
}

function submitVolunteer(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#volunteer-entry-status");
  const preferredRole = String(formData.get("preferredRole") || "").trim();
  const unavailableRole = String(formData.get("unavailableRole") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  volunteerRoster.push({
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    preferredRole,
    unavailableRole,
    role: "",
    notes,
  });

  resetVolunteerAssignments();
  persistVolunteerRoster();
  renderVolunteerRoster();
  form.reset();
  setVolunteerStatus(status, "봉사자를 명단에 추가했습니다. 여러 명을 입력한 뒤 AI 역할 배정 생성 버튼을 눌러 주세요.", "ok");
}

function handleVolunteerList(event) {
  const removeButton = event.target.closest(".list-remove-button");
  if (!removeButton) {
    return;
  }

  const index = Number(removeButton.getAttribute("data-index"));
  volunteerRoster.splice(index, 1);
  resetVolunteerAssignments();
  persistVolunteerRoster();
  renderVolunteerRoster();
}

function generateVolunteerAssignments() {
  const status = document.querySelector("#volunteer-save-status");

  if (volunteerRoster.length === 0) {
    setVolunteerStatus(status, "먼저 역할 배정을 위한 봉사자 명단을 추가해 주세요.", "error");
    return;
  }

  const assignedRoster = autoAssignVolunteerRoles(volunteerRoster);
  volunteerRoster.splice(0, volunteerRoster.length, ...assignedRoster);
  persistVolunteerRoster();
  renderVolunteerRoster();
  setVolunteerStatus(status, "AI가 희망 역할과 불가한 역할을 바탕으로 역할 배정을 생성했습니다.", "ok");
}

async function saveVolunteerRoster() {
  const status = document.querySelector("#volunteer-save-status");

  if (!ensureVolunteerAppsScript(status)) {
    return;
  }

  if (volunteerRoster.length === 0) {
    setVolunteerStatus(status, "먼저 저장할 봉사자 명단을 추가해 주세요.", "error");
    return;
  }

  const hasGeneratedAssignments = volunteerRoster.some((volunteer) => volunteer.role);
  if (!hasGeneratedAssignments) {
    setVolunteerStatus(status, "먼저 AI 역할 배정 생성 버튼을 눌러 배정 결과를 만들어 주세요.", "error");
    return;
  }

  setVolunteerStatus(status, "봉사자 역할 배정 정보를 저장 중입니다...", "pending");

  try {
    await window.CAMP_BACKEND.postToAppsScript(buildVolunteerPayload(volunteerRoster));
    setVolunteerStatus(status, "봉사자 명단 저장 요청을 보냈습니다. `봉사자명단` 탭에서 반영 여부를 확인해 주세요.", "ok");
  } catch (error) {
    setVolunteerStatus(status, "저장 요청에 실패했습니다. Apps Script 웹앱 설정을 다시 확인해 주세요.", "error");
  }
}

function clearVolunteerRoster() {
  const status = document.querySelector("#volunteer-save-status");
  volunteerRoster.splice(0, volunteerRoster.length);
  persistVolunteerRoster();
  renderVolunteerRoster();
  setVolunteerStatus(status, "봉사자 명단을 비웠습니다.", "pending");
}

const volunteerEntryForm = document.querySelector("#volunteer-entry-form");
if (volunteerEntryForm) {
  volunteerEntryForm.addEventListener("submit", submitVolunteer);
}

const volunteerList = document.querySelector("#volunteer-list");
if (volunteerList) {
  volunteerList.addEventListener("click", handleVolunteerList);
}

const volunteerGenerateButton = document.querySelector("#volunteer-generate-button");
if (volunteerGenerateButton) {
  volunteerGenerateButton.addEventListener("click", generateVolunteerAssignments);
}

const volunteerSaveButton = document.querySelector("#volunteer-save-button");
if (volunteerSaveButton) {
  volunteerSaveButton.addEventListener("click", saveVolunteerRoster);
}

const volunteerClearButton = document.querySelector("#volunteer-clear-button");
if (volunteerClearButton) {
  volunteerClearButton.addEventListener("click", clearVolunteerRoster);
}

window.VOLUNTEERS_PAGE = {
  autoAssignVolunteerRoles,
  buildVolunteerPayload,
};

renderVolunteerRoster();
