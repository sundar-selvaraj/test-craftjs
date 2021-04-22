import { Row, Col } from 'antd';

import Sider from './Components/Sider';
import Content, { TextComponent } from './Components/Content';
import { Editor } from './Components/Craft';

import {enablePatches} from "immer";
enablePatches()

function App() {
  return (
    <div>
      <Editor
        resolver={{
          TextComponent
        }}
      >
      <Row>
        <Col flex={2}>
          <Sider />
        </Col>
        <Col flex={4}>
          <Content />
        </Col>
      </Row>
      </Editor>
    </div>
  );
}

export default App;
