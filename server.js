// server.js

// 1. express 모듈을 가져옵니다.
const express = require('express');

// 2. express 애플리케이션 객체 생성
const app = express();

// 3. 사용할 포트를 지정합니다. 기본적으로 3000번을 많이 사용합니다.
const PORT = 3000;

// 4. 라우터 설정: 사용자가 '/'로 접속했을 때 실행되는 함수
app.get('/', (req, res) => {
  // 클라이언트에게 보내는 응답 (문자열)
  res.send('Node.js 서버에 오신 것을 환영합니다!');
});

// 5. 서버 시작: 지정한 포트로 서버를 열고, 콜백 함수로 상태 출력
app.listen(PORT, () => {
  console.log(`서버가 실행 중입니다: http://localhost:${PORT}`);
});

app.use(express.static('public'));