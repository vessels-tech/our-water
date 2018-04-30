import React, {Component} from 'react'
import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types';
import { VictoryAxis, VictoryLine, VictoryChart } from 'victory';
import moment from 'moment';


class CumulativeGraphLine extends Component {

  render() {
    if (this.props.data.loading) {
      return null;
    }

    const data = this.props.data.cumulativeWeeklyReadings.map((reading, idx) => {
      const date = moment(reading.week).format('D-M-Y');
      return {
        x:reading.week,
        y: reading.value
        // value: idx * this.props.max
      };
    });

    data.forEach(data => console.log(`x:${data.x}, y:${data.y}`));

    return (
      <VictoryLine
        standalone={false}
        style={this.props.style}
        data={data}
        // animate={{
        //   duration: 2000,
        //   onLoad: { duration: 1000 }
        // }}
      />
    )
  }
}

CumulativeGraphLine.propTypes = {
  resourceId: PropTypes.number,
  postcode: PropTypes.number,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  style: PropTypes.object,

}

const CumulativeQuery = gql`
  query cumulativeWeeklyReadings($resourceId: Int!, $postcode: Int!, $startDate: DateTime!, $endDate: DateTime!) {
    cumulativeWeeklyReadings(resourceId:$resourceId, postcode:$postcode, startDate:$startDate, endDate:$endDate) {
      week
      value
    }
  }
`
const CumulativeGraphLineWithCumulativeQuery = graphql(CumulativeQuery)(CumulativeGraphLine);

export default CumulativeGraphLineWithCumulativeQuery;
