import React from 'react';
import { Tabs } from 'antd';
import { PictureFilled, FontSizeOutlined } from '@ant-design/icons';

import { Element, useEditor } from '../Craft';

import { TextComponent } from '../Content';

const { TabPane } = Tabs;

const Sider = () => {
    const {
        enabled,
        connectors: { create },
        actions,
        canUndo,
        canRedo,
    } = useEditor((state = {}, query) => {
        console.log('state', state);
        return {
            enabled: state.options.enabled,
            // canUndo: query.history.canUndo(),
            // canRedo: query.history.canRedo(),
        }
    });
    const handleDrag = (event) => {
        console.log('handleDrag', event);
    };
    return (
        <div className="sider-wrapper">
            <Tabs centered>
                <TabPane tab="SETTINGS" key="1">
                    <div className="section-items-wrapper">
                        <div className="section-item" ref={ref=> create(ref, <TextComponent text="sample" />)}>
                            <div className="section-icon">
                                <PictureFilled />
                            </div>
                            Image
                        </div>
                        <div className="section-item" ref={ref=> create(ref, <TextComponent text="sample" />)}>
                            <div className="section-icon">
                                <FontSizeOutlined />
                            </div>
                            Heading
                        </div>
                        {/* <div
                            className="section-item"
                            ref={(ref) =>
                                create(ref, <TextComponent fontSize="12" textAlign="left" text="Hi there" />)
                            }
                        >
                            <div className="section-icon">
                                <FontSizeOutlined />
                            </div>
                            Heading
                        </div> */}
                    </div>
                </TabPane>
                <TabPane tab="LAYOUT" key="2"></TabPane>
                <TabPane tab="BUILD" key="3"></TabPane>
            </Tabs>
        </div>
    )
}

export default Sider;
