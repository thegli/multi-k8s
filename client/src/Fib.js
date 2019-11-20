import React, { Component } from 'react';
import Axios from 'axios';

class Fib extends Component {
  state = {
    seenIndicies: [],
    values: {},
    index: ''
  };

  componentDidMount() {
      this.fetchValues();
      this.fetchIndicies();
  }

  async fetchIndicies() {
    const seenIndicies = await Axios.get('/api/values/all');
    // cheap check to prevent storage of html response if api is not available
    if (seenIndicies.hasOwnProperty('data')) {
      this.setState({ seenIndicies: seenIndicies.data });
    }
  }

  async fetchValues() {
    const values = await Axios.get('/api/values/current');
    // cheap check to prevent storage of html response if api is not available
    if (values.hasOwnProperty('data') && values.data[0] !== '<') {
      this.setState({ values: values.data });
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    await Axios.post('/api/values', {
      index: this.state.index
    });
    this.setState({ index: '' });
  };

  renderSeenIndicies() {
    // check if index history has values to render
    if (this.state.seenIndicies && this.state.seenIndicies.length) {
      return this.state.seenIndicies.map(({ number }) => number).join(', ');
    } else {
      return ('No history available');
    }
  }

  renderValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} the calculated number is {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <p>This is a test application used for learning Docker and Kubernetes.</p>
        <form onSubmit={this.handleSubmit}>
          <label>Enter index (0-40): </label>
          <input
            maxLength="2"
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          /> 
          <button>Calculate</button>
        </form>

        <h3>Visited Indicies</h3>
        {this.renderSeenIndicies()}

        <h3>Calculated Fib numbers</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
