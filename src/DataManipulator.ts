//This file will be responsible for processing the raw
//stock data we’ve received from the server before it throws it back to the Graph
//component’s table to render. 

import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number 
  | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    // +/-10% of the 12 month
    // historical average ratio (i.e. 1.1 and 0.9)
    const upperBound = 1 + 0.1;
    const lowerBound = 1 - 0.1;
      return {
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        // return the greater of the two timestamps
        timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
          serverRespond[0].timestamp : serverRespond[1].timestamp,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        //trigger_alert returns the ratio if its value falls out of range i.e. not between th set boundaries
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
  }
}
