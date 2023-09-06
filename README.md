# RollCakeServer
### _롤케이크 서버_ 혹은 _ESD 핫딜 서버_ 
>경상국립대학교 컴퓨터과학과
>팀장 박주철(19학번)

# 개요
>__제1회 경남소프트웨어경진대회 최우수상 수상작__

ESD 핫딜 프로젝트는 전자 소프트웨어 유통망(ESD). 즉, 소프트웨어 판매 사이트에 올라오는 할인 적용된 소프트웨어와 무료 배포된 소프트웨어의 데이터를 수집 후, 목록의 형태로 정리하여 보여주는 웹서비스이다. 그리고 해당 리포지토리는 이러한 ESD 핫딜 프로젝트의 서버 및 크롤링을 담당하는 부분의 리포지토리이다.

***
# 상세
### 개발 인원
- 팀장 박주철
   - 프로젝트 지휘, 계획, 관리
   - 구글 파이어베이스 및 데이터베이스 구축
   - 서버 및 크롤링 기능 구현
   - 자료 조사
   - 전반적인 웹 컴포넌트 제작
   - 메인 페이지 제작
- 팀원 황승현
   - 검색 기능 구현
   - 핫딜 상세 페이지 구현
   - 검색 페이지 구현

### 개발 기술
본 프로젝트 개발에 사용된 라이브러리 및 파이프라인입니다.
- [Firebase] - 모바일, 웹 애플리케이션 개발 플랫폼
- [Morgan] - 미들웨어로 HTTP 요청 로그를 기록해주는 모듈
- [Express] - 웹 애플리케이션 프레임워크로 서버 개발을 쉽게 해주는 모듈
- [Puppeteer] - Headless Chrome 브라우저를 제어하여 웹 스크래핑 및 자동화에 사용하는 모듈

### 개발 환경
| 종류 | 목록 |
| ------ | ------ |
| 사용 언어 | JavaScript, Node.js |
| 개발 도구 | Visual Studio, Github |
| 데이터베이스 | Firebase Cloud Firestore Database |
| OS 환경 | Windows 10 |

### 포크 & 모듈 & 리포지토리
본 프로젝트의 포크 혹은 분리되어 개발된 모듈 혹은 관련된 추가 리포지토리 목록입니다.
- __ESD HotDeal Project__
  - [ESD HotDeal Repository] - SW HotDeal 프로젝트의 웹 이식 프로젝트 Repository입니다.
  - [ESD HotDeal 컴포넌트 Repository] - ESD HotDeal 프로젝트에서 사용된 컴포넌트 Repository입니다.
  - [ESD HotDeal 서버 및 크롤러 Repository] - ESD HotDeal 프로젝트의 서버 및 크롤러 Repository입니다. (현 Repository)
- __SW HotDeal Project__
  - [SW HotDeal Repository] - SW HotDeal 프로젝트의 Repository입니다.
  - [SW HotDeal 서버 및 크롤러 Repository] - SW HotDeal의 서버 및 크롤러 Repository입니다. 

### 자료
본 개발을 하면서 작성된 보고서 및 발표 자료입니다.
| 보고서 자료 | 발표 자료 | 웹 영상 | 서버 영상 |
| ------ | ------ | ------ | ------ |
| [보고서 PDF 링크](https://docs.google.com/document/d/11a1hUlnwAQjH2MC0RfKzKhdPp8IlytFq/edit?usp=drive_link&ouid=106667079864051075882&rtpof=true&sd=true) | [최종 발표 PPT 링크](https://docs.google.com/presentation/d/1y2-nzHxk3UYwxlNv0yVu6miRpDEnzWXX/edit?usp=sharing&ouid=106667079864051075882&rtpof=true&sd=true) | [웹 시연 영상](https://drive.google.com/file/d/1WjPRqsJGs_sSo3xaNEbiaxdb0gb3m_1v/view?usp=sharing) | [서버 시연 영상](https://drive.google.com/file/d/1PytRefM5tajlfW-WSYkEzFbcdgVAsoV6/view?usp=sharing) |

### 수상
__제1회 경남소프트웨어경진대회__
- 다수의 ESD에서 제공하는 할인 및 무료 소프트웨어 목록을 크롤링 및 정리해서 알려주는 웹사이트인 'ESD 핫딜'을 개발.
- __[최우수상 수상]__ | __[수상 기사]__

### 기타
- 본 프로젝트는 SW HotDeal 프로젝트의 웹 이식 및 개선형 개발물입니다.

[Firebase]: <https://firebase.google.com/?hl=ko>
[Morgan]: <https://www.npmjs.com/package/morgan>
[Express]: <https://expressjs.com/ko/>
[Puppeteer]: <https://www.npmjs.com/package/puppeteer>

[SW HotDeal Repository]: <https://github.com/valur628/swHotDealProjcect>
[SW HotDeal 서버 및 크롤러 Repository]: <https://github.com/valur628/swHotDealServer>
[ESD HotDeal Repository]: <https://github.com/valur628/RollCakeProject>
[ESD HotDeal 컴포넌트 Repository]: <https://github.com/valur628/RollCakeComponents>
[ESD HotDeal 서버 및 크롤러 Repository]: <https://github.com/valur628/RollCakeServer>

[최우수상 수상]: <http://www.gnict.org/%EA%B2%8C%EC%8B%9C%ED%8C%90/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD/%EC%A0%9C1%ED%9A%8C-%EA%B2%BD%EB%82%A8%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4-%EA%B2%BD%EC%A7%84%EB%8C%80%ED%9A%8C-%EC%99%84%EB%A3%8C/>
[수상 기사]: <http://www.knnews.co.kr/news/articleView.php?idxno=1362660>
