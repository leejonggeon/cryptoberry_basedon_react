This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## CryptoBerry -> React project
1. create-react-app으로 생성한 기본 프로젝트에서 react-scripts를 사용하지 않고 Webpack 기반으로 재구성 
2. cryptoberry에서 사용하는 Dependecies 를 설치 (package.json 파일에서 필요한 모듈 복사 후, yarn 명령실행하여 동기화) 
3. cryptoberry 프로젝트에서 로그인과 토큰생성 기능만 Merge 후, 간단한 UI와 consol 창을 이용하여 테스트

## TODO
1. WebPack, Babel 공부 필요 (유투브, 블로그 활용)
2. react 기반으로 사용자 인터페이스(UI) 개발 
3. UI에 맞는 기능을 순차적으로 추가 필요 (현재는 로그인과, 토큰생성만 존재)

## Available Scripts

In the project directory, you can run:

### `yarn webpack`

Runs the app in the development mode.<br />
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `작업 이력`

create-react-app react-test3

[기본 동작 확인]
  cd react-test3
  yarn start

==> react-scripts는 특정 버전의 webpack 에 의존함

# webpack dependencies 설치
yarn add -D webpack webpack-cli webpack-dev-server

# webpack config 파일 생성
Add webpack.config.js

yarn add -D @babel/core @babel/preset-env @babel/preset-react babel-loader

# babel config 파일 생성 
Add babel.config.js


#css loader 추가 

yarn add -D css-loader
yarn add -D style-loader

# webpack config 파일에 rules에 추가 
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },


# class properties
npm install --save-dev @babel/plugin-proposal-class-properties


# react-scripts 삭제 
Dependencies 에서 "react-scripts": "3.4.3" 삭제


# html-webpack-plugin
yarn add -D html-webpack-plugin


# file-loader 
# Now you can import your SVG and use it as a variabl
yarn add -D file-loader
yarn add -D ipfs-http-client@



함수형 컴포넌트 (Functional Component) -> 클래스형 컴포넌트로 변경 
deployedXXXX 파일 복사 


package.json 파일에 추가 
dependencies 
    "caver-js": "1.4.1",
    "connect-privkey-to-provider": "0.0.3",
    "spin.js": "^4.0.0",
    "truffle-hdwallet-provider-klaytn": "^1.0.13-a"

  "devDependencies": {
    "ipfs-http-client": "32.0.1",
  },

yarn 명령어 패키지 다운로드 (npm install 로하면 에러 발생)

#webpack.config.js에 외부 심볼 정의 

# error 발생 
VM251 bundle.js:231790 Uncaught ReferenceError: regeneratorRuntime is not defined

async 함수를 사용하기 위해서는 
app.js에 
문구 추가 
import "@babel/polyfill/noConflict";  <- index.js에 추가해도 됨

