// study 페이지 관리

// 서버를 갖추고 모듈화 할때 사용방법 (현재는 import export없이 study.js앞에 링크거는 것으로 해결)
// import { studyCategory} from 'D:/git_repositorys/open_work_space/MathApp/B_data/studyCategory.js';
// import { courseData } from 'D:/git_repositorys/open_work_space/MathApp/B_data/courseData.js';

// study.js
// 템플릿 기반으로 study.html의 #contents 영역을 동적으로 구성
// 변경된 부분과 주석을 자세히 포함한 예시코드

document.addEventListener("DOMContentLoaded", function() {

  //-----------------------------------
  // 0. 템플릿 및 기본 DOM 요소 가져오기
  //-----------------------------------
  const tStudyTitle       = document.getElementById("study-title");    // 상단 타이틀용 템플릿
  const tStudySelect      = document.getElementById("study-select");   // course + problem 선택 폼 템플릿
  const tConfirmButton    = document.getElementById("confirm-button"); // 확인 버튼 템플릿
  const tPage             = document.querySelector("template.page");   // A4 페이지용 템플릿

  // #study-select 템플릿 안에 <template class="course">, <template class="problem">가 포함됨
  const tCourse  = tStudySelect.content.querySelector("template.course");
  const tProblem = tStudySelect.content.querySelector("template.problem");

  const contents  = document.getElementById("contents");
  const xCategory = document.getElementById("x-category");  // 상단 선택흔적 표시
  const ySlide    = document.getElementById("y-slide");     // 좌측 슬라이드메뉴

  //-----------------------------------
  // 1. ySlide(좌측 메뉴) 동적 구성
  //-----------------------------------
  let yHtml = "<div>";
  for (const outerCat in studyCategory) {
    yHtml += `<ul class="list-y">${outerCat}`;
    const innerObj = studyCategory[outerCat];
    for (const key in innerObj) {
      yHtml += `<li id="${key}" data-category="${outerCat}">${innerObj[key]}</li>`;
    }
    yHtml += `</ul><div class="interval-y"></div>`;
  }
  yHtml += "</div>";
  ySlide.innerHTML = yHtml;

  //-----------------------------------
  // 2. #contents를 매번 비우는 함수
  //-----------------------------------
  function clearContents() {
    contents.innerHTML = "";
  }

  //-----------------------------------
  // 3. 템플릿 복제 함수들
  //-----------------------------------
  // (1) study-title 템플릿 로드
  function createStudyTitleElement() {
    const wrapper = document.createElement("div");
    wrapper.id = "study-title";
    const clone = tStudyTitle.content.cloneNode(true);
    wrapper.appendChild(clone);
    return wrapper;
  }

  // (2) study-select 템플릿 로드
  function createStudySelectElement(needsCourse, needsProblem) {
    const wrapper = document.createElement("div");
    wrapper.id = "study-select";

    const tempClone = tStudySelect.content.cloneNode(true); // 전체 clone

    if (needsCourse) {
      const courseDiv = document.createElement("div");
      courseDiv.classList.add("course");
      courseDiv.appendChild(tCourse.content.cloneNode(true));
      wrapper.appendChild(courseDiv);
    }

    if (needsProblem) {
      const problemDiv = document.createElement("div");
      problemDiv.classList.add("problem");
      problemDiv.appendChild(tProblem.content.cloneNode(true));
      wrapper.appendChild(problemDiv);
    }

    return wrapper;
  }

  // (3) confirm-button 템플릿 로드
  function createConfirmButtonElement() {
    const wrapper = document.createElement("div");
    wrapper.id = "confirm-button";
    const clone = tConfirmButton.content.cloneNode(true);
    wrapper.appendChild(clone);
    return wrapper;
  }

  // (4) page(A4) 템플릿 로드
  function createPageElement() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("page");
    wrapper.style.display = "block";
    const clone = tPage.content.cloneNode(true);
    wrapper.appendChild(clone);
    return wrapper;
  }

  //-----------------------------------
  // 4. ySlide에서 li 클릭 시 동작
  //-----------------------------------
  ySlide.addEventListener("click", function(event) {
    if (event.target.tagName.toLowerCase() === "li") {
      const selectedId      = event.target.id;
      const selectedText    = event.target.textContent;
      const selectedOuterCat= event.target.dataset.category;

      // 상단 xCategory 갱신
      xCategory.innerHTML = `<div>${selectedOuterCat}</div><div class="interval-x"></div><div>${selectedText}</div>`;

      // 어떤 폼 구조가 필요한지 판별
      const setCourseOnly = [
        "c-principle", "e-testSupplement", "e-examSimulationSupplement", 
        "e-satSimulationSupplement", "p-learningAnalysis"
      ];
      const setCourseAndProblem = [
        "c-basic", "c-training", "c-intensive", 
        "e-test", "e-examSimulation", "e-satSimulation"
      ];

      let needsCourse  = false;
      let needsProblem = false;

      if (setCourseOnly.includes(selectedId)) {
        needsCourse  = true;
      } else if (setCourseAndProblem.includes(selectedId)) {
        needsCourse  = true;
        needsProblem = true;
      }

      clearContents();

      // study-title 로드
      const studyTitleEl = createStudyTitleElement();
      // 타이틀의 기본 내용을 선택한 메뉴 이름으로 대체
      studyTitleEl.textContent = selectedText;
      contents.appendChild(studyTitleEl);

      // study-select 로드
      let studySelectEl = null;
      if (needsCourse || needsProblem) {
        studySelectEl = createStudySelectElement(needsCourse, needsProblem);
        contents.appendChild(studySelectEl);
      }

      // confirm-button 로드
      const confirmButtonEl = createConfirmButtonElement();
      contents.appendChild(confirmButtonEl);

      const btn = confirmButtonEl.querySelector("button");
      if (needsCourse && needsProblem) {
        btn.textContent = "구성하기";
      } else if (needsCourse) {
        btn.textContent = "선택하기";
      } else {
        btn.textContent = "선택하기 or 구성하기";
      }

      // 4-1. course 부분 이벤트 연결
      if (needsCourse && studySelectEl) {
        setUpCourseEventListeners(studySelectEl);
      }
      // 4-2. problem 부분 이벤트 연결
      if (needsProblem && studySelectEl) {
        setUpProblemEventListeners(studySelectEl);
      }

      // 5. 버튼 클릭 시 (확정)
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        handleConfirm(needsCourse, needsProblem, studySelectEl);
      });
    }
  });

  // [추가] course/problem 폼의 선택사항을 상단 title에 반영하기 위한 함수
  // [추가] 문제유형과 난이도도 함께 표시하기 위해 기존 updateStudyTitle를 확장
  function updateStudyTitle() {
    const studyTitleEl = document.getElementById("study-title");
    if (!studyTitleEl) return;

    // (1) course 부분
    let courseText    = "";
    let unitText      = "";
    let categoryTexts = [];

    const courseDiv = document.querySelector("#study-select .course");
    if (courseDiv) {
      const checkedRadio = courseDiv.querySelector('input[name="course"]:checked');
      if (checkedRadio) {
        const labelEl = checkedRadio.previousElementSibling;
        if (labelEl && labelEl.tagName.toLowerCase() === "label") {
          courseText = labelEl.textContent.trim();
        }
      }

      const unitSelect         = courseDiv.querySelector("#unit-select");
      const categoryCheckboxDiv= courseDiv.querySelector("#category-checkbox");

      if (unitSelect && unitSelect.value) {
        unitText = unitSelect.options[unitSelect.selectedIndex].textContent.trim();
      }

      if (categoryCheckboxDiv) {
        const checkedCategory = categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked');
        checkedCategory.forEach(chk => {
          const parentLabel = chk.parentElement;
          if (parentLabel) {
            categoryTexts.push(parentLabel.textContent.trim());
          }
        });
      }
    }

    // (2) problem 부분(유형, 난이도, 문항수)
    /// [추가]
    let typeText    = "";
    let diffTexts   = [];
    let rangeNumber = "";
    const problemDiv = document.querySelector("#study-select .problem");
    if (problemDiv) {
      // 문제유형 라디오
      const checkedType = problemDiv.querySelector('input[name="type"]:checked');
      if (checkedType) {
        const typeLabel = checkedType.previousElementSibling;
        if (typeLabel) {
          typeText = typeLabel.textContent.trim();
        }
      }
      // 난이도 체크박스
      const diffChecked = problemDiv.querySelectorAll('input[name="difficulty"]:checked');
      diffChecked.forEach(chk => {
        const labelEl = chk.previousElementSibling;
        if (labelEl) {
          diffTexts.push(labelEl.textContent.trim());
        }
      });
      // 문항수
      const rangeOutput = problemDiv.querySelector("#questionOutput");
      if (rangeOutput) {
        rangeNumber = rangeOutput.value; 
      }
    }

    // (3) 최종 타이틀 문자열 구성
    //     "과정 → 대단원 → 소단원... → 유형 → 난이도... → n문항" 
    let titleParts = [];
    if (courseText) {
      titleParts.push(courseText);
    }
    if (unitText) {
      titleParts.push(unitText);
    }
    if (categoryTexts.length > 0) {
      titleParts.push(categoryTexts.join(", "));
    }
    if (typeText) {
      titleParts.push(typeText);
    }
    if (diffTexts.length > 0) {
      titleParts.push(diffTexts.join(", "));
    }
    if (rangeNumber) {
      titleParts.push(rangeNumber + "문항");
    }

    const newTitle = titleParts.join(" → ");
    studyTitleEl.textContent = newTitle || "타이틀....";
  }

  //-----------------------------------
  // 5. course 폼 이벤트 설정
  //-----------------------------------
  function setUpCourseEventListeners(containerEl) {
    const courseDiv          = containerEl.querySelector(".course");
    if (!courseDiv) return;

    const courseRadios       = courseDiv.querySelectorAll('input[name="course"]');
    const unitSelect         = courseDiv.querySelector("#unit-select");
    const categoryCheckboxDiv= courseDiv.querySelector("#category-checkbox");

    let selectedCourseData = [];

    function refreshTitle() {
      /// [수정] 기존 별도 로직이었던 갱신함수를 updateStudyTitle()로 교체
      updateStudyTitle();
    }

    // 과정 라디오 change
    courseRadios.forEach(radio => {
      radio.addEventListener("change", function() {
        unitSelect.innerHTML = '<option value="">대단원 선택</option>';
        unitSelect.disabled = true;
        categoryCheckboxDiv.innerHTML = '';
        refreshTitle();

        const courseKey = this.value;
        if (courseData[courseKey]) {
          selectedCourseData = courseData[courseKey];
          let uniqueUnits = {};
          selectedCourseData.forEach(item => {
            const unitKey = Object.keys(item.unit)[0];
            const unitVal = Object.values(item.unit)[0];
            if (!uniqueUnits[unitKey]) {
              uniqueUnits[unitKey] = unitVal;
            }
          });
          for (const key in uniqueUnits) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = uniqueUnits[key];
            unitSelect.appendChild(option);
          }
          unitSelect.disabled = false;
        }
      });
    });

    // 대단원 select change
    unitSelect.addEventListener("change", function() {
      categoryCheckboxDiv.innerHTML = '';
      refreshTitle();

      const selectedUnit = this.value;
      if (selectedUnit && selectedCourseData.length > 0) {
        const matchingItems = selectedCourseData.filter(item => {
          return Object.keys(item.unit)[0] === selectedUnit;
        });
        matchingItems.forEach(item => {
          const sortedKeys = Object.keys(item.category).sort();
          sortedKeys.forEach(key => {
            const label = document.createElement("label");
            label.style.display = "block";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "category";
            checkbox.value = key;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(item.category[key]));
            categoryCheckboxDiv.appendChild(label);
          });
        });
      }
    });

    // 소단원 checkbox change
    categoryCheckboxDiv.addEventListener("change", function() {
      refreshTitle();
    });
  }

  //-----------------------------------
  // 6. problem 폼 이벤트 설정
  //-----------------------------------
  function setUpProblemEventListeners(containerEl) {
    const problemDiv = containerEl.querySelector(".problem");
    if (!problemDiv) return;

    const typeRadios     = problemDiv.querySelectorAll('input[name="type"]');
    const diffCheckboxes = problemDiv.querySelectorAll('input[name="difficulty"]');
    const rangeInput     = problemDiv.querySelector("#questionCount");

    // 초기 상태: 난이도/문항수 비활성화
    diffCheckboxes.forEach(chk => {
      chk.disabled = true;
    });
    if (rangeInput) {
      rangeInput.disabled = true;
    }

    /// [추가] 상단 title 갱신 함수
    function refreshTitle() {
      updateStudyTitle();
    }

    // type 선택 시 난이도 활성화
    typeRadios.forEach(radio => {
      radio.addEventListener("change", function() {
        diffCheckboxes.forEach(chk => {
          // 만약 value가 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 'p' 또는 'x' 계속  disabled 유지
          if (chk.value === 'p' || chk.value === 'x') {
            return;
          }
          // 나머지 항목은 활성화
          chk.disabled = false;
          chk.checked = false; // 새 라디오 선택 시 기존 체크값 초기화
        });
        if (rangeInput) {
          rangeInput.value = 10;
          rangeInput.disabled = true;
        }
        refreshTitle();
      });
    });

    // 난이도 체크박스 중 하나 이상 체크되면 문항수 활성화, 아니면 비활성화
    diffCheckboxes.forEach(chk => {
      chk.addEventListener("change", function() {
        const anyChecked = Array.from(diffCheckboxes).some(c => c.checked);
        if (rangeInput) {
          rangeInput.disabled = !anyChecked; 
        }
        refreshTitle();
      });
    });

    // range 표시
    const rangeOutput= problemDiv.querySelector("#questionOutput");
    if (rangeInput && rangeOutput) {
      rangeInput.addEventListener("input", function() {
        rangeOutput.value = this.value;
        refreshTitle();  /// [추가]
      });
    }
  }

  // [추가] 확인 버튼 클릭 후 titleText를 y-slide에 나열 표시
  function showTitleTextInYSlide() {
    // [추가] 현재 #study-title 요소의 textContent 전체
    const studyTitleEl = document.getElementById("study-title");
    if (!studyTitleEl) return;
    const finalTitleText = studyTitleEl.textContent || "";

    // 기존 titleText div가 있다면 제거
    const oldDiv = document.getElementById("titleText");
    if (oldDiv) {
      oldDiv.remove();
    }

    // 새 div 생성
    const newDiv = document.createElement("div");
    newDiv.id = "titleText";

    // ' → ' 기준으로 분할 -> 각 요소를 줄바꿈 형태로 추가
    const splitted = finalTitleText.split("→");
    splitted.forEach(txt => {
      const line = txt.trim();
      if (line) {
        const lineDiv = document.createElement("div");
        lineDiv.textContent = line;
        newDiv.appendChild(lineDiv);
      }
    });

    // y-slide 영역에 삽입
    ySlide.appendChild(newDiv);
  }

  //-----------------------------------
  // 7. 확인 버튼(handleConfirm) 처리
  //-----------------------------------
  function handleConfirm(needsCourse, needsProblem, studySelectEl) {
    // 7-1. 현재 입력값 파악
    let courseCodes = [];
    if (needsCourse && studySelectEl) {
      const courseDiv = studySelectEl.querySelector(".course");
      if (courseDiv) {
        const unitSelect         = courseDiv.querySelector("#unit-select");
        const categoryCheckboxDiv= courseDiv.querySelector("#category-checkbox");
        const unitKey = unitSelect ? unitSelect.value : "";
        const checkedCategories = categoryCheckboxDiv ? categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked') : [];
        checkedCategories.forEach(chk => {
          courseCodes.push(unitKey + chk.value);
        });
      }
    }

    let problemCodes = [];
    let questionCount = 10; // 기본
    if (needsProblem && studySelectEl) {
      const problemDiv = studySelectEl.querySelector(".problem");
      if (problemDiv) {
        const selectedType = problemDiv.querySelector('input[name="type"]:checked');
        if (selectedType) {
          const diffChecks = problemDiv.querySelectorAll('input[name="difficulty"]:checked');
          diffChecks.forEach(chk => {
            problemCodes.push(selectedType.value + chk.value);
          });
        }
        const qCountInput = problemDiv.querySelector("#questionCount");
        if (qCountInput) {
          questionCount = parseInt(qCountInput.value, 10);
        }
      }
    }
    
    // 중간 점검 확인용 console
    // console.log("과정코드:", courseCodes, "문제코드:", problemCodes, "문항수:", questionCount);

    // 7-2. 입력값 부족여부 확인
    if (needsCourse && !needsProblem) {
      // courseOnly
      if (courseCodes.length === 0) {
        showCautionMessage("선택조건이 부족합니다.");
        return; // 이미지 로딩 X
      }
    } else if (needsCourse && needsProblem) {
      // course + problem
      if (courseCodes.length === 0 || problemCodes.length === 0) {
        showCautionMessage("원하시는 문제의 구성을 완료해주세요.");
        return; // 문제 로딩 X
      }
    }

    // 입력조건 이상 없으면 메시지 제거 후 진행
    removeCautionMessage();

    // [추가] y-slide 영역에 titleText div에 최종 선택내용 표시
    showTitleTextInYSlide();

    // #contents 초기화 후 페이지생성
    clearContents();
    const pageElement = createPageElement();
    contents.appendChild(pageElement);

    const pageContents = pageElement.querySelector(".page-contents");
    if (!pageContents) return;

    // 7-3. courseCodes만 있을 경우(원리학습 이미지)
    if (courseCodes.length > 0 && problemCodes.length === 0) {
      const allImageElements = [];
      const imageLoadPromises = [];

      courseCodes.forEach(code => {
        const unitKey = code.substring(0,2);
        const fileList = principleImageID[unitKey] || [];
        const matchingFiles = fileList.filter(file => file.startsWith(code));

        matchingFiles.forEach(file => {
          const wrapperDiv = document.createElement("div");
          const img = document.createElement("img");
          img.src = "https://storage.googleapis.com/mathproblemdb-9f42d.firebasestorage.app/mathproblem_high_principleData/" + file;

          const imgLoadPromise = new Promise(resolve => {
            img.onload = resolve;
            img.onerror= resolve;
          });

          imageLoadPromises.push(imgLoadPromise);
          wrapperDiv.appendChild(img);
          allImageElements.push(wrapperDiv);
        });
      });

      Promise.all(imageLoadPromises).then(() => {
        allImageElements.forEach(el => pageContents.appendChild(el));
        paginateContents();
      });
    }

    // 7-4. courseCodes + problemCodes (문제 DB 로드)
    if (courseCodes.length > 0 && problemCodes.length > 0) {
      const combinedCodes = [];
      courseCodes.forEach(cCode => {
        problemCodes.forEach(pCode => {
          combinedCodes.push(cCode + pCode); 
        });
      });

      const matchingProblemCodes = [];
      combinedCodes.forEach(prefix => {
        const unitKey = prefix.substring(0,2);
        const allProblems = problemID[unitKey] || [];
        const matches = allProblems.filter(code => code.startsWith(prefix));
        matchingProblemCodes.push(...matches);
      });

      // 무작위 selectedCodes 뽑기
      const selectedCodes = [];
      const usedIndices = new Set();
      while (selectedCodes.length < questionCount && usedIndices.size < matchingProblemCodes.length) {
        const randIdx = Math.floor(Math.random() * matchingProblemCodes.length);
        if (!usedIndices.has(randIdx)) {
          usedIndices.add(randIdx);
          selectedCodes.push(matchingProblemCodes[randIdx]);
        }
      }

      // Firestore에서 문제 불러오기
      const fetchPromises = selectedCodes.map(fullCode => {
        const unitKey     = fullCode.substring(0,2);
        const categoryKey = fullCode.substring(2,4);

        let unitName = "", categoryName = "";
        outer: for (const cKey in courseData) {
          for (const item of courseData[cKey]) {
            const uKey = Object.keys(item.unit)[0];
            const uVal = Object.values(item.unit)[0];
            if (uKey === unitKey) {
              unitName = uVal;
              if (item.category[categoryKey]) {
                categoryName = item.category[categoryKey];
                break outer;
              }
            }
          }
        }

        const unitDocId     = `${unitKey}_${unitName}`;
        const categoryDocId = `${categoryKey}_${categoryName}`;
        const problemDocId  = fullCode;

        return db
          .collection("high_units")
          .doc(unitDocId)
          .collection("contents")
          .doc(categoryDocId)
          .collection("problems")
          .doc(problemDocId)
          .get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();
              return {
                code: problemDocId,
                html_Q: data.html_Q,
                html_A: data.html_A
              };
            }
            return null;
          });
      });

      Promise.all(fetchPromises).then(results => {
        // 난이도 우선순위 배열
        const diffOrder = ["f","e","d","c","b","a","x"];
        
        // 하나의 compare 함수로 정렬(안정 정렬 가정)
        results.sort((a,b) => {
          if (!a || !b) return 0; // null guard
          // A. categoryCode 오름차순
          const catA = a.code.substring(2,4);
          const catB = b.code.substring(2,4);
          if (catA !== catB) {
            // 숫자로도 가능하지만, 문자열로도 "00"~"99" 정렬이면 OK
            return catA.localeCompare(catB);
          }
          // B. difficulty 순서
          const diffA = a.code[5]; 
          const diffB = b.code[5];
          const rankA = diffOrder.indexOf(diffA);
          const rankB = diffOrder.indexOf(diffB);
          return rankA - rankB;
          // 동일 난이도면 0 -> 원본 순서 유지
        });

        // 두자리 문제번호, code + 정답
        let problemIndex = 1; // 1부터 시작
        results.forEach(item => {
          if (item) {
            // 문제 block
            const wrapperQ = document.createElement("div");
            wrapperQ.id = item.code;
            wrapperQ.className = "question";
            // 문제번호를 "01", "02"... 형태로 표시
            const numberString = String(problemIndex).padStart(2, "0");
            // wrapperQ.textContent = "문제 " + numberString;
            const qText = document.createElement("span");
            qText.className = "qtext";
            qText.innerHTML = "문제 " + numberString;
            wrapperQ.appendChild(qText);
            // 문제(내용)
            const divQ = document.createElement("div");
            divQ.innerHTML = item.html_Q || "";
            wrapperQ.appendChild(divQ);

            // solution 파트를 배치할 자리!!!!!!!!!!!!!!!!!!!!
            // 구분간격
            // const spanQ = document.createElement("span");
            // spanQ.className = "interval-y";
            // wrapperQ.appendChild(spanQ);           

            // 정답 block
            const wrapperA = document.createElement("div");
            wrapperA.className = "answer";
            // [code] 정답
            const aText = document.createElement("span");
            aText.className = "atext";
            aText.innerHTML = item.code + " 정답";
            wrapperA.appendChild(aText);
            // 정답(내용)
            const divA = document.createElement("div");
            divA.innerHTML =  (item.html_A || "");
            wrapperA.appendChild(divA);
            // 구분 간격
            const spanA = document.createElement("span");
            spanA.className = "interval-y";
            wrapperA.appendChild(spanA);

            pageContents.appendChild(wrapperQ);
            pageContents.appendChild(wrapperA);

            problemIndex++;
          }
        });

        // MathJax(수식렌더링), 페이지나눔
        MathJax.typeset();
        paginateContents();
      })
      .catch(error => {
        console.error("문제 데이터 로딩 실패:", error);
      });
    }
  }

  // caution 메시지 표시/제거 함수
  function showCautionMessage(msg) {
    removeCautionMessage(); // 혹시 기존 메시지가 있으면 제거

    // confirm-button 아래에 div.caution 삽입
    const confirmArea = document.getElementById("confirm-button");
    if (!confirmArea) return;
    const cautionDiv = document.createElement("div");
    cautionDiv.className = "caution";
    cautionDiv.textContent = msg;
    confirmArea.appendChild(cautionDiv);

    // 메시지 외 영역 클릭 시 사라지게 (한 번만 등록되도록)
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0);

    function handleOutsideClick(e) {
      // confirmArea나 cautionDiv 자체를 클릭하면 유지
      if (!confirmArea.contains(e.target)) {
        removeCautionMessage();
        document.removeEventListener("click", handleOutsideClick);
      }
    }
  }
  function removeCautionMessage() {
    const cautionEl = document.querySelector("#confirm-button .caution");
    if (cautionEl) {
      cautionEl.remove();
    }
  }

  //-----------------------------------
  // 8. A4 페이지 분할 함수
  //-----------------------------------
  function paginateContents() {
    const allPages = Array.from(contents.querySelectorAll(".page"));
    if (allPages.length === 0) return;

    const pageHeight = allPages[0].offsetHeight;

    const allItems = [];
    allPages.forEach(page => {
      const pc = page.querySelector(".page-contents");
      if (pc) {
        allItems.push(...Array.from(pc.children));
      }
    });

    allPages.forEach(page => page.remove());

    let currentPage = createPageElement(); 
    contents.appendChild(currentPage);
    let currentContents = currentPage.querySelector(".page-contents");

    allItems.forEach(item => {
      currentContents.appendChild(item);
      if (currentPage.scrollHeight > pageHeight) {
        currentContents.removeChild(item);

        currentPage = createPageElement();
        contents.appendChild(currentPage);
        currentContents = currentPage.querySelector(".page-contents");
        currentContents.appendChild(item);
      }
    });
  }

  // [추가] html_Q 영역에서 드래그 시 활성화할 이벤트
  document.addEventListener("mouseup", function() {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;
      if (commonAncestor.nodeType === 3) {
        commonAncestor = commonAncestor.parentNode;
      }
      // class="html_Q" 내부에서만 동작
      if (commonAncestor.closest && commonAncestor.closest('.html_Q')) {
        // 선택영역 근처에 팝업을 표시하기 위해 boundingRect 계산
        const rect = range.getBoundingClientRect();
  
        // 팝업(메시지 박스) element 생성
        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.background = '#ffe';  // 임시 스타일
        popup.style.padding = '6px 12px';
        popup.style.border = '1px solid #ccc';
        popup.style.zIndex = '9999';
  
        // 메시지 및 버튼 구성 (취소 버튼 없이)
        popup.innerHTML = `
          <div style="margin-bottom:6px;">AI연결 질문 확인 기능</div>
          <button type="button" id="popupConfirm">확인</button>
        `;
  
        document.body.appendChild(popup);
  
        // 아래쪽에 표시할 때 y좌표 (약간 띄워줌, 8px 등)
        let topPos = window.scrollY + rect.bottom + 8;
        let leftPos = window.scrollX + rect.left;
  
        // 만약 아래 공간이 부족하면 위로 배치
        const viewportHeight = window.innerHeight;
        if (rect.bottom + 100 > viewportHeight) {
          topPos = window.scrollY + rect.top - popup.offsetHeight - 8;
        }
        popup.style.top = topPos + 'px';
        popup.style.left = leftPos + 'px';
  
        // 팝업을 제거하는 함수 (선택영역도 해제)
        function removePopup() {
          selection.removeAllRanges(); 
          if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
          document.removeEventListener('click', outsideClickHandler);
        }
  
        // 팝업 외부를 클릭하면 '취소'로 간주하여 팝업 제거
        function outsideClickHandler(e) {
          if (!popup.contains(e.target)) {
            removePopup();
          }
        }
  
        // 확인 버튼 클릭 시 선택영역 span으로 감싸고, 팝업 사라지도록
        popup.querySelector('#popupConfirm').addEventListener('click', (evt) => {
          evt.stopPropagation(); // 팝업 안에서의 클릭 이벤트 버블링 방지
          const span = document.createElement('span');
          span.className = 'selectedText';
          try {
            range.surroundContents(span);
          } catch (error) {
            console.log('선택 영역 감싸기 에러:', error);
          } finally {
            // 감싸기 성공 여부와 관계없이 팝업은 바로 제거(아직은 부족 확인 클릭후 바로사라지지 않음....)
            removePopup();
          }
        });
  
        // 팝업이 DOM에 추가된 이후에 이벤트 등록
        setTimeout(() => {
          document.addEventListener('click', outsideClickHandler);
        }, 0);
      }
    }
  });
  
});
