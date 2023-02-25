import React from 'react';

import Sketch from './Sketch';

class MainCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.container = null;
    }

    componentDidMount() { 
        //initialize scene
        this.sketch = new Sketch(this.container);
    }

    componentWillUnmount() {
        //stop renderering
        this.sketch.stop();
    }
    
    render() {
        return (
        <div id='container' ref={ref => (this.container = ref)}></div>
        )
    }
}

export default MainCanvas;