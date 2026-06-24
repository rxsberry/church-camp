const TEAM_STORAGE_KEY = "camp-teams-page-state";
const teamState = loadTeamState();

function setTeamStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

function escapeTeamHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toTeamPositiveInteger(value, fallbackValue) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackValue;
  }

  return Math.floor(parsed);
}

function shuffleTeamItems(items) {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentValue = nextItems[index];
    nextItems[index] = nextItems[randomIndex];
    nextItems[randomIndex] = currentValue;
  }
  return nextItems;
}

function ensureTeamAppsScript(statusElement) {
  if (!window.CAMP_BACKEND || !window.CAMP_BACKEND.hasAppsScriptEndpoint()) {
    setTeamStatus(statusElement, "Apps Script 저장 URL이 연결되지 않았습니다.", "error");
    return false;
  }
  return true;
}

function loadTeamState() {
  try {
    const stored = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (!stored) {
      return { students: [], generatedTeams: [] };
    }

    const parsed = JSON.parse(stored);
    return {
      students: Array.isArray(parsed.students) ? parsed.students : [],
      generatedTeams: Array.isArray(parsed.generatedTeams) ? parsed.generatedTeams : [],
    };
  } catch (error) {
    return { students: [], generatedTeams: [] };
  }
}

function persistTeamState() {
  try {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamState));
  } catch (error) {
    // Keep working in memory if localStorage is blocked.
  }
}

function buildTeams(students, options) {
  const teamCount = toTeamPositiveInteger(options.teamCount, 1);
  const prefix = String(options.teamPrefix || "다니엘").trim() || "다니엘";
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    teamName: `${prefix} ${index + 1}조`,
    members: [],
  }));

  const studentsByGrade = new Map();
  students.forEach((student) => {
    const list = studentsByGrade.get(student.grade) || [];
    list.push(student);
    studentsByGrade.set(student.grade, list);
  });

  Array.from(studentsByGrade.keys())
    .sort()
    .forEach((grade) => {
      const source = studentsByGrade.get(grade) || [];
      const group = options.shuffle ? shuffleTeamItems(source) : [...source];
      group.forEach((student, index) => {
        const teamIndex = index % teamCount;
        const slot = Math.floor(index / teamCount);
        const zigzagIndex = slot % 2 === 0 ? teamIndex : teamCount - 1 - teamIndex;
        teams[zigzagIndex].members.push(student);
      });
    });

  return teams;
}

function buildTeamsPayload(teams) {
  return {
    type: "team",
    teams: teams.map((team) => ({
      teamName: team.teamName,
      members: team.members.map((member) => ({
        name: member.name,
        grade: member.grade,
        notes: member.notes,
      })),
    })),
  };
}

function renderStudents() {
  const container = document.querySelector("#team-student-list");
  const empty = document.querySelector("#team-student-empty");
  const count = document.querySelector("#team-student-count");
  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${teamState.students.length}명`;
  }

  if (teamState.students.length === 0) {
    empty.style.display = "block";
    container.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = teamState.students
    .map(
      (student, index) => `
        <details class="tool-item tool-collapse-item">
          <summary class="tool-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeTeamHtml(student.name)}</strong>
              <div class="tool-collapse-chips">
                <span class="mini-meta">${escapeTeamHtml(student.grade)}</span>
              </div>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <p>학년: ${escapeTeamHtml(student.grade)}</p>
            <span>${escapeTeamHtml(student.notes || "메모 없음")}</span>
            <div class="tool-inline-actions">
              <button type="button" class="list-remove-button" data-index="${index}">삭제</button>
            </div>
          </div>
        </details>
      `,
    )
    .join("");
}

function renderGeneratedTeams() {
  const container = document.querySelector("#team-result-list");
  const empty = document.querySelector("#team-result-empty");
  const count = document.querySelector("#team-result-count");
  if (!container || !empty) {
    return;
  }

  if (count) {
    count.textContent = `${teamState.generatedTeams.length}조`;
  }

  if (teamState.generatedTeams.length === 0) {
    empty.style.display = "block";
    container.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = teamState.generatedTeams
    .map(
      (team) => `
        <details class="tool-item tool-collapse-item">
          <summary class="tool-collapse-summary">
            <div class="tool-collapse-main">
              <strong>${escapeTeamHtml(team.teamName)}</strong>
              <div class="tool-collapse-chips">
                <span class="summary-chip">${team.members.length}명</span>
              </div>
            </div>
            <span class="tool-collapse-toggle">자세히 보기</span>
          </summary>
          <div class="tool-collapse-body">
            <div class="team-member-list">
              ${team.members
                .map(
                  (member) => `
                    <div class="member-row">
                      <span class="member-pill">${escapeTeamHtml(member.name)}</span>
                      <span class="mini-meta">${escapeTeamHtml(member.grade)}</span>
                      <span class="mini-meta">${escapeTeamHtml(member.notes || "메모 없음")}</span>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        </details>
      `,
    )
    .join("");
}

function submitStudent(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#team-student-status");

  teamState.students.push({
    name: String(formData.get("name") || "").trim(),
    grade: String(formData.get("grade") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  });

  teamState.generatedTeams = [];
  persistTeamState();
  renderStudents();
  renderGeneratedTeams();
  form.reset();
  setTeamStatus(status, "학생을 목록에 추가했습니다. 설정을 확인한 뒤 조편성 결과를 생성해 주세요.", "ok");
}

function handleStudentListClick(event) {
  const button = event.target.closest(".list-remove-button");
  if (!button) {
    return;
  }

  const index = Number(button.getAttribute("data-index"));
  teamState.students.splice(index, 1);
  teamState.generatedTeams = [];
  persistTeamState();
  renderStudents();
  renderGeneratedTeams();
}

function generateTeams() {
  const status = document.querySelector("#team-save-status");
  const form = document.querySelector("#team-settings-form");
  if (!form) {
    return;
  }

  if (teamState.students.length === 0) {
    setTeamStatus(status, "먼저 학생을 한 명 이상 추가해 주세요.", "error");
    return;
  }

  const formData = new FormData(form);
  teamState.generatedTeams = buildTeams(teamState.students, {
    teamCount: formData.get("teamCount"),
    teamPrefix: formData.get("teamPrefix"),
    shuffle: formData.get("shuffle") === "on",
  });

  persistTeamState();
  renderGeneratedTeams();
  setTeamStatus(status, "조편성 결과를 생성했습니다. 확인 후 저장할 수 있습니다.", "ok");
}

function resetGeneratedTeams() {
  const status = document.querySelector("#team-save-status");
  teamState.generatedTeams = [];
  persistTeamState();
  renderGeneratedTeams();
  setTeamStatus(status, "조편성 결과를 초기화했습니다.", "pending");
}

async function saveGeneratedTeams() {
  const status = document.querySelector("#team-save-status");
  if (!ensureTeamAppsScript(status)) {
    return;
  }

  if (teamState.generatedTeams.length === 0) {
    setTeamStatus(status, "조편성 결과를 먼저 생성한 뒤 저장해 주세요.", "error");
    return;
  }

  setTeamStatus(status, "조편성 결과를 저장 중입니다...", "pending");

  try {
    await window.CAMP_BACKEND.postToAppsScript(buildTeamsPayload(teamState.generatedTeams));
    setTeamStatus(status, "조편성 저장 요청을 보냈습니다. `조편성` 탭에서 반영 여부를 확인해 주세요.", "ok");
  } catch (error) {
    setTeamStatus(status, "저장 요청에 실패했습니다. Apps Script 웹앱 설정을 다시 확인해 주세요.", "error");
  }
}

function clearStudents() {
  const status = document.querySelector("#team-save-status");
  teamState.students = [];
  teamState.generatedTeams = [];
  persistTeamState();
  renderStudents();
  renderGeneratedTeams();
  setTeamStatus(status, "학생 목록과 조편성 결과를 모두 비웠습니다.", "pending");
}

const teamStudentForm = document.querySelector("#team-student-form");
if (teamStudentForm) {
  teamStudentForm.addEventListener("submit", submitStudent);
}

const teamStudentList = document.querySelector("#team-student-list");
if (teamStudentList) {
  teamStudentList.addEventListener("click", handleStudentListClick);
}

const teamGenerateButton = document.querySelector("#team-generate-button");
if (teamGenerateButton) {
  teamGenerateButton.addEventListener("click", generateTeams);
}

const teamResetButton = document.querySelector("#team-reset-button");
if (teamResetButton) {
  teamResetButton.addEventListener("click", resetGeneratedTeams);
}

const teamSaveButton = document.querySelector("#team-save-button");
if (teamSaveButton) {
  teamSaveButton.addEventListener("click", saveGeneratedTeams);
}

const teamClearButton = document.querySelector("#team-clear-button");
if (teamClearButton) {
  teamClearButton.addEventListener("click", clearStudents);
}

window.TEAMS_PAGE = {
  buildTeams,
  buildTeamsPayload,
};

renderStudents();
renderGeneratedTeams();
