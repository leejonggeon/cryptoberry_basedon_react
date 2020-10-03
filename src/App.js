import React from 'react';
import logo from './logo.svg';
import './App.css';
import Caver from "caver-js";
import { Spinner } from 'spin.js';

const config = {
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}

const cav = new Caver(config.rpcURL);
const yttContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);
//ABI와 ADDRESS 값을 넘겨서 contract에 인스턴스를 생성한다
const tsContract = new cav.klay.Contract(DEPLOYED_ABI_TOKENSALES, DEPLOYED_ADDRESS_TOKENSALES);
//tokensales ABI와 주소를 넘겨서 okensales contract 인스턴스를 생성한다
var ipfsClient = require('ipfs-http-client');//ipfs 클라이언트를 import 한다
var ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });
//host가 어떤 노드에 연결해서 파일을 업로드할 것인지(infura라는 공개노드가 있다.)
//https://ipfs.github.io/public-gateway-checker/
//여기서 공개노드를 활용할 것 
//port 5001은 디폴트

/* we will use class component instead of Functional component */
/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}
*/

class App extends React.Component {

  constructor(props) {
    super(props);
    this.auth = {
      accessType: 'keystore',
      keystore: '',
      password: "!@#$%12345"
    }
  }

  componentDidMount() {

  }

  checkValidKeystore = (keystore) => {
    const parsedKeystore = JSON.parse(keystore);
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;

    return isValidKeystore;
  }

  integrateWallet = (privateKey) => {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    //this.changeUI(walletInstance);  
    console.log("walletInstance: " + walletInstance);
  }

  handleFileChanged = (e) => {

    e.preventDefault();
    console.log("target name:" + e.target.value);

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0]);
    fileReader.onload = (event) => {
      try {
        if (!this.checkValidKeystore(event.target.result)) {
          console.log("유효하지 않은 keystore 파일입니다.");
          return;
        }
        this.auth.keystore = event.target.result;
        console.log("keystore 통과");
      } catch (event) {
        console.log("유효하지 않은 keystore 파일입니다.");
        return;
      }
    }

  }

  handleLogin = () => {

    if (this.auth.accessType === 'keystore') {
      try {
        console.log(this.auth.keystore);
        console.log(this.auth.password);
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.integrateWallet(privateKey);
      } catch (e) {
        console.log("비밀번호가 일치하지 않습니다." + e) ;
      }
    }

  }

  getWallet = () => {
    if (cav.klay.accounts.wallet.length) {
      return cav.klay.accounts.wallet[0];
    }
  }

  getERC721MetadataSchema = (videoId, title, imgUrl) => {

    return {
      "title": "Asset Metadata",
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": videoId
        },
        "description": {
          "type": "string",
          "description": title
        },
        "image": {
          "type": "string",
          "description": imgUrl
        }
      }
    }

  }

  handleCreateToken = async () => {

      //var spinner = this.showSpinner();
    var videoId = "MyVideoID";
    var title = "MyTitle";
    var author = "MyAuthor";
    var dateCreated = "MyCreatedDate";
    try {
      const metaData = this.getERC721MetadataSchema(videoId, title, `삽입할 이미지${videoId}`);
      //metaData를 JSON.stringify 파일을 통해 JSON 문자열로 변환하고 
      //Buffer.from을 통해 문자열을 바이너리데이터로 변환(ipfs는 바이너리데이터만 인식)
      //ipfs.add로 ipfs에 업로드한다!!
      //awiat를 통해 비동기로 마무리한다
      var res = await ipfs.add(Buffer.from(JSON.stringify(metaData)));
      await this.mintYTT(videoId, author, dateCreated, res[0].hash);
      //res[0].hash가 tokenURI이다!!
    } catch (err) {
      console.error(err);
    }

  }

  mintYTT = async (videoId, author, dateCreated, hash) => {

    //비앱사용자가 토큰을 발행할 때 어떻게 하면 가스비를 내지 않는지.
    //배포한 계정이 대납계정이 되어서 사용자 계정의 가스비를 대신 내준다   
    const sender = this.getWallet();// 함수를 호출하는 계정
    const feePayer = cav.klay.accounts.wallet.add('0x4e2fc35f9a305401b0f7dedf2dcaa97f3cb0bb9dcae12378d9f31d7644fc34a7')
    //가스비를 대신 내주는 계정
    // 대납계정의 private key를 넣어줘야한다
    // cav = caver 

    const { rawTransaction: senderRawTransaction } = await cav.klay.accounts.signTransaction({
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',//컨트랙 대납 타입
      from: sender.address,//sender계정이 호출한다
      to: DEPLOYED_ADDRESS,//전역상수/배포된 contract의 주소
      data: yttContract.methods.mintYTT(videoId, author, dateCreated, "https://ipfs.infura.io/ipfs/" + hash).encodeABI(),
      //매개변수를 mintYTT 함수로 넘기는 과정이다
      //tokenURI는 해쉬값을 웹주소 뒤에 붙이는("https://ipfs.infura.io/ipfs/" + hash) 방식이댜
      //이 주소로 메타데이터가 업로드된다.!!
      //이 모든 부분들을 클레이튼 버추얼머신이 이해할 수 있도록 .encodeABI를 통해 ABI 스펙에 맞게 인코딩한다!!!
      gas: '500000',
      value: cav.utils.toPeb('0', 'KLAY'),
    }, sender.privateKey)//트렌젝션에 sender가 서명을 한다

    cav.klay.sendTransaction({
      senderRawTransaction: senderRawTransaction,//위의 서명이 끝난 transaction을 넘긴다
      feePayer: feePayer.address,//feepayer의 공개주소를 넘긴다
    })

      .then(function (receipt) {
        if (receipt.transactionHash) {//제대로 영수증을 받았다면
          console.log("https://ipfs.infura.io/ipfs/" + hash);//console.log로 보여준다
          alert(receipt.transactionHash);
          location.reload();//새로고침
        }
      });


  }


  render() {

    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            React App Test2
        </p>
        </header>
        <div>

          <input display="none" id="raised-button-file" type="file" onChange={this.handleFileChanged} /><br />
          <label htmlFor="raised-button-file">
          </label>
          <button className="button" onClick={this.handleLogin}>Login</button>
          <button className="button" onClick={this.handleCreateToken}>Create Token</button>
        </div>
        <div>
          <p className="App-header" id="message"></p>
        </div>

      </div>
    );
  }

}



export default App;
