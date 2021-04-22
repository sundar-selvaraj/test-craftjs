import { Fragment, useEffect } from 'react';
import { useNode } from "../Craft";

const defaultProps = {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fillSpace: 'no',
    padding: ['0', '0', '0', '0'],
    margin: ['0', '0', '0', '0'],
    background: { r: 255, g: 255, b: 255, a: 1 },
    color: { r: 0, g: 0, b: 0, a: 1 },
    shadow: 0,
    radius: 0,
    width: '100%',
    height: 'auto',
};

const Container = (props) => {
    const {
        store: { query },
        connectors: { connect, drag },
        ...rest
    } = useNode();
    useEffect(() => {
        let element = document.getElementById('load-container');
        console.log('element------', element);
        if (element) {
            try {
                let data = query.parseReactElement(element);
                if (data) {
                    let testData = data.toNodeTree();
                    console.log('---------data', testData);
                }
            } catch (err) {
                console.log('err------------', err);
            }
            
        }
    }, [query]);
    console.log('-------rest', query);

    const mainProps = {
        ...defaultProps,
        ...props,
    };
    const {
        flexDirection,
        alignItems,
        justifyContent,
        fillSpace,
        background,
        color,
        padding,
        margin,
        shadow,
        radius,
        children,
        width,
        height,
        contentHtml
    } = mainProps;

    let dangerProps = {};
    // if (contentHtml) {
        /* <div
                // propKey={{ width: 'width', height: 'height' }}
                id="load-container"
                ref={(ref) => connect(drag(ref))}
                style={{
                    justifyContent,
                    flexDirection,
                    alignItems,
                    background: `rgba(${Object.values(background)})`,
                    color: `rgba(${Object.values(color)})`,
                    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
                    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
                    boxShadow:
                        shadow === 0
                            ? 'none'
                            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
                    borderRadius: `${radius}px`,
                    flex: fillSpace === 'yes' ? 1 : 'unset',
                    // width: width ? width : '100%',
                    height: height ? height : '100%'
                }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            /> */
    // }

    return (
        <Fragment>
            <div
                // propKey={{ width: 'width', height: 'height' }}
                ref={(ref) => connect(drag(ref))}
                style={{
                    justifyContent,
                    flexDirection,
                    alignItems,
                    background: `rgba(${Object.values(background)})`,
                    color: `rgba(${Object.values(color)})`,
                    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
                    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
                    boxShadow:
                        shadow === 0
                            ? 'none'
                            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
                    borderRadius: `${radius}px`,
                    flex: fillSpace === 'yes' ? 1 : 'unset',
                    width: width ? width : '100%',
                    height: height ? height : '100%'
                }}
                {...dangerProps}
            >
                {children}
            </div>
            <div
                // propKey={{ width: 'width', height: 'height' }}
                id="load-container"
                ref={(ref) => connect(drag(ref))}
                style={{
                    justifyContent,
                    flexDirection,
                    alignItems,
                    background: `rgba(${Object.values(background)})`,
                    color: `rgba(${Object.values(color)})`,
                    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
                    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
                    boxShadow:
                        shadow === 0
                            ? 'none'
                            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
                    borderRadius: `${radius}px`,
                    flex: fillSpace === 'yes' ? 1 : 'unset',
                    // width: width ? width : '100%',
                    height: height ? height : '100%'
                }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            /> 
        </Fragment>
    );
};

Container.craft = {
    displayName: 'Container',
    props: defaultProps,
    rules: {
        canDrag: () => true,
    },
};

export default Container;
