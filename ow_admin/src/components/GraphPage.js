import React, {Component} from 'react'
import moment from 'moment';

import CumulativeGraph from './CumulativeGraph'
import { SelectButton } from './common';

const DateRange = {
  ONE_YEAR: 0,
  THREE_MONTH: 1,
  ONE_MONTH: 2
};

class GraphPage extends Component {

  constructor(props) {
    super(props);

    const startDates = [
      moment('2016-01-01').toDate(),
      moment('2015-01-01').toDate(),
      moment('2014-01-01').toDate(),
    ];

    const endDates = [
      moment('2017-01-01').toDate(),
      moment('2016-01-01').toDate(),
      moment('2015-01-01').toDate(),
    ];

    this.state = {
      startDates,
      endDates
    }
  }

  changeDates(dateRangeEnum) {
    let startDates = [];

    switch (dateRangeEnum) {
      case DateRange.ONE_YEAR:
        startDates = [
          moment('2016-01-01').toDate(),
          moment('2015-01-01').toDate(),
          moment('2014-01-01').toDate(),
        ];
        break;
      case DateRange.THREE_MONTH:
        startDates = [
          moment('2016-10-01').toDate(),
          moment('2015-10-01').toDate(),
          moment('2014-10-01').toDate(),
        ];

        break;
      case DateRange.ONE_MONTH:
      default:
        startDates = [
          moment('2016-12-01').toDate(),
          moment('2015-12-01').toDate(),
          moment('2014-12-01').toDate(),
        ];
      break;
    }

    this.setState({
      startDates
    });
  }

  render() {
    const buttonConfig = [
      { callback:() => this.changeDates(DateRange.ONE_YEAR), name: "1 Year" },
      { callback:() => this.changeDates(DateRange.THREE_MONTH), name: "3 Month" },
      { callback:() => this.changeDates(DateRange.ONE_MONTH), name: "1 Month" },
    ];

    return (
      <div>
        <CumulativeGraph
          resourceId={1111}
          postcode={313603}
          startDates={this.state.startDates}
          endDates={this.state.endDates}
        />
        <SelectButton
          buttonConfig={buttonConfig}
          selectedIndex={3}
        />
      </div>
    );
  }
}

export default GraphPage;
