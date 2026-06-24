const toolGroups = [
  {
    id: "before",
    title: "캠프 전",
    accent: "peach",
    icon: "✳",
    tools: [
      {
        name: "캠프 신청폼",
        description: "참가 신청을 간편하게 받고 명단을 한곳에서 관리합니다.",
        url: "https://claude.ai/public/artifacts/cabaa1d7-b6a2-45f5-be68-708f10ee8742",
      },
      {
        name: "스마트 조 편성",
        description: "학년·성별·친밀도를 고려해 균형 잡힌 조를 자동으로 만들어 줍니다.",
        url: "https://claude.ai/public/artifacts/b9e77bca-29df-48a4-86ea-fe731d4813ff",
      },
      {
        name: "봉사자 역할 매칭",
        description: "교사·스태프의 은사와 일정을 반영해 사역 역할을 배정합니다.",
        url: "https://claude.ai/public/artifacts/20928ff6-225c-45fd-a3ea-44f6128c2d1d",
      },
      {
        name: "차량 배치 도우미",
        description: "탑승 인원과 동선을 고려해 차량 배치를 한 번에 정리합니다.",
        url: "https://claude.ai/public/artifacts/c5e5a149-12ca-4d5e-b4ea-a89fd3c44bbe",
      },
      {
        name: "준비물 체크리스트",
        description: "개인·조별·전체 준비물을 빠짐없이 점검할 수 있도록 도와줍니다.",
        url: "https://claude.ai/public/artifacts/e271e723-3669-4b1d-9805-32eaeed87970",
      },
      {
        name: "홍보물 디자인 스튜디오",
        description: "포스터·카드뉴스 등 캠프 홍보물을 AI로 빠르게 만들어 냅니다.",
        url: "https://claude.ai/public/artifacts/49063846-c297-46fb-84f6-376ecebc821f",
      },
      {
        name: "단체티 디자인 메이커",
        description: "올해 캠프의 무드에 어울리는 단체티 시안을 다양하게 제안합니다.",
        url: "https://claude.ai/public/artifacts/ee7388fa-1843-448f-8948-e4c5d8b3839e",
      },
      {
        name: "찬양 콘티 생성기",
        description: "예배 흐름에 맞춰 곡 순서와 전환을 담은 콘티를 자동으로 구성합니다.",
        url: "https://claude.ai/public/artifacts/9ee85c7d-3eb4-4312-a6c7-dda36a95ebfb",
      },
      {
        name: "찬양 추천 AI",
        description: "캠프 주제와 분위기에 어울리는 찬양을 큐레이션해 추천합니다.",
        url: "https://claude.ai/public/artifacts/8aa91c6b-9280-4f3b-908f-2b43cd86735d",
      },
    ],
  },
  {
    id: "during",
    title: "캠프 중",
    accent: "sky",
    icon: "✳",
    tools: [
      {
        name: "레크리에이션 추천",
        description: "인원과 공간에 맞는 신나는 레크리에이션을 골라서 제안합니다.",
        url: "https://claude.ai/public/artifacts/4d73e50c-1363-4f7c-8852-924297c1891c",
      },
      {
        name: "성경 속 음식 퀴즈",
        description: "성경에 등장하는 음식들로 풀어 보는 흥미진진한 퀴즈입니다.",
        url: "https://claude.ai/public/artifacts/a59a8ae6-e4fb-4cf0-a649-6a98bb4942a9",
      },
      {
        name: "성경 지식 퀴즈",
        description: "다니엘서를 중심으로 성경 지식을 겨루는 퀴즈 한 판입니다.",
        url: "https://claude.ai/public/artifacts/aa1a3d7f-5047-4dfe-81c8-d5ee38b2ac14",
      },
      {
        name: "사자굴 게임",
        description: "다니엘의 사자굴 이야기를 모티프로 한 미션형 팀 게임입니다.",
        url: "https://claude.ai/public/artifacts/8a43b280-657b-4ecb-8cf5-ce0baec3d35c",
      },
      {
        name: "거짓 선지자 찾기",
        description: "단서를 모아 거짓 선지자를 가려내는 추리 미션 게임입니다.",
        url: "https://claude.ai/public/artifacts/cd2f1704-730e-4031-a42f-39aa35f59743",
      },
      {
        name: "성경 이모지 게임",
        description: "이모지로 표현된 성경 이야기를 맞히는 두뇌 게임입니다.",
        url: "https://claude.ai/public/artifacts/1100559b-b11e-4105-8ae5-70087630b4cd",
      },
      {
        name: "예수님 미션 러너",
        description: "달리며 미션을 수행하는 활기찬 야외 러닝 게임입니다.",
        url: "https://claude.ai/public/artifacts/4634ae01-db09-4a26-8c69-5597f199c6f0",
      },
      {
        name: "찬양 제목 맞추기",
        description: "전주·가사 힌트로 찬양 제목을 맞히는 즐거운 게임입니다.",
        url: "https://claude.ai/public/artifacts/40475dec-54df-48b0-9a64-1e3502322685",
      },
      {
        name: "기도문 생성기",
        description: "오늘의 묵상과 마음을 담은 기도문을 함께 만들어 줍니다.",
        url: "https://claude.ai/public/artifacts/8eb9c318-8f6a-4cd7-8336-43667c8069bf",
      },
      {
        name: "실시간 스케줄 공유",
        description: "오늘의 일정과 변경 사항을 모두에게 실시간으로 알려 줍니다.",
        url: "https://claude.ai/public/artifacts/f422f1d8-c940-4a5a-b86a-09792603ed8c",
      },
      {
        name: "잃어버린 양 찾기",
        description: "학생들의 이동 현황을 실시간으로 기록하는 안전 트래킹입니다.",
        url: "https://claude.ai/public/artifacts/5c601695-2158-4b20-831d-d56a4ae9ad1e",
      },
    ],
  },
  {
    id: "after",
    title: "캠프 후",
    accent: "mint",
    icon: "✳",
    tools: [
      {
        name: "소감문 작성 도우미",
        description: "캠프에서 받은 은혜를 진솔한 소감문으로 정리하도록 돕습니다.",
        url: "https://claude.ai/public/artifacts/c73038a2-6442-4469-8492-caa84e8c8780",
      },
      {
        name: "영수증 자동 발급",
        description: "지출 내역을 정리해 영수증을 손쉽게 발급하고 보관합니다.",
        url: "https://claude.ai/public/artifacts/1237732c-0ca5-4007-917b-418a7c075b24",
      },
      {
        name: "사진 자동 정리",
        description: "캠프 사진을 인물·장면별로 정리해 추억을 한눈에 모아 줍니다.",
        url: "https://claude.ai/public/artifacts/21cee897-db83-4e62-86b1-1e783714d30b",
      },
      {
        name: "기도 제목 관리",
        description: "친구들과 함께 나눈 기도 제목을 꾸준히 기억하고 응답을 기록합니다.",
        url: "https://claude.ai/public/artifacts/de4fce15-0280-4dd4-9619-ad3028b9f583",
      },
      {
        name: "포도송이 실천판",
        description: "여름성경학교용 실천 활동지를 만들어 일상의 믿음을 이어 갑니다.",
        url: "https://claude.ai/public/artifacts/39630fd5-a571-40a1-8bdb-3ab8a80a4f14",
      },
    ],
  },
];

const APPS_SCRIPT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyHPayakkQ1pi_LJSRdett-3oPzn6VGNwvfhNF1HtcTTK_wolkDQrys5JK0HcHmk2U/exec";

function renderGroup(group) {
  const container = document.querySelector(`[data-group="${group.id}"]`);
  if (!container) {
    return;
  }

  container.innerHTML = group.tools
    .map(
      (tool) => `
        <article class="tool-card ${group.accent}">
          <span class="tool-chip" aria-hidden="true">${group.icon}</span>
          <h3>${tool.name}</h3>
          <p>${tool.description}</p>
          <a href="${tool.url}" target="_blank" rel="noopener noreferrer">
            <span class="tool-link-label">도구 열기</span>
            <span class="tool-link-meta">새 탭 ↗</span>
          </a>
        </article>
      `,
    )
    .join("");
}

toolGroups.forEach(renderGroup);

function setStatus(target, message, state) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.setAttribute("data-state", state);
}

async function postToAppsScript(payload) {
  await fetch(APPS_SCRIPT_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
}

function validateEndpoint(statusElement) {
  if (!APPS_SCRIPT_ENDPOINT) {
    setStatus(
      statusElement,
      "현재 저장 연결을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      "error",
    );
    return false;
  }
  return true;
}

async function submitRegistration(event) {
  event.preventDefault();

  const status = document.querySelector("#registration-status");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    type: "registration",
    studentName: formData.get("studentName"),
    grade: formData.get("grade"),
    guardianName: formData.get("guardianName"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  };

  if (!validateEndpoint(status)) {
    return;
  }

  setStatus(status, "신청 정보를 저장 중입니다...", "pending");

  try {
    await postToAppsScript(payload);
    setStatus(
      status,
      "신청 정보 저장 요청을 보냈습니다. 반영까지 몇 초 정도 걸릴 수 있습니다.",
      "ok",
    );
    form.reset();
  } catch (error) {
    setStatus(
      status,
      "저장 요청에 실패했습니다. Apps Script 웹앱 배포 권한과 접근 가능 범위를 확인해 주세요.",
      "error",
    );
  }
}

async function submitReflection(event) {
  event.preventDefault();

  const status = document.querySelector("#reflection-status");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    type: "reflection",
    studentName: formData.get("studentName"),
    content: formData.get("content"),
  };

  if (!validateEndpoint(status)) {
    return;
  }

  setStatus(status, "소감문을 저장 중입니다...", "pending");

  try {
    await postToAppsScript(payload);
    setStatus(
      status,
      "소감문 저장 요청을 보냈습니다. 반영까지 몇 초 정도 걸릴 수 있습니다.",
      "ok",
    );
    form.reset();
  } catch (error) {
    setStatus(
      status,
      "저장 요청에 실패했습니다. Apps Script 웹앱 배포 권한과 접근 가능 범위를 확인해 주세요.",
      "error",
    );
  }
}

async function submitPrayer(event) {
  event.preventDefault();

  const status = document.querySelector("#prayer-status");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    type: "prayer",
    name: formData.get("name"),
    category: formData.get("category"),
    content: formData.get("content"),
  };

  if (!validateEndpoint(status)) {
    return;
  }

  setStatus(status, "기도제목을 저장 중입니다...", "pending");

  try {
    await postToAppsScript(payload);
    setStatus(
      status,
      "기도제목 저장 요청을 보냈습니다. 반영까지 몇 초 정도 걸릴 수 있습니다.",
      "ok",
    );
    form.reset();
  } catch (error) {
    setStatus(
      status,
      "저장 요청에 실패했습니다. Apps Script 웹앱 배포 권한과 접근 가능 범위를 확인해 주세요.",
      "error",
    );
  }
}

const registrationForm = document.querySelector("#registration-form");
if (registrationForm) {
  registrationForm.addEventListener("submit", submitRegistration);
}

const reflectionForm = document.querySelector("#reflection-form");
if (reflectionForm) {
  reflectionForm.addEventListener("submit", submitReflection);
}

const prayerForm = document.querySelector("#prayer-form");
if (prayerForm) {
  prayerForm.addEventListener("submit", submitPrayer);
}
