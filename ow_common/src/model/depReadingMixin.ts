

type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
    doThing = () => console.log("doing thing");
  };
}

function Builder<TBase extends Constructor, I>(Base: TBase, buildFunc: (builder: I) => TBase) {
  return class extends Base {
    static build = buildFunc;
  };
}

export type IReading = {
  // type: ReadingType.Any;
  datetime: string; //iso formatted string
  value: number;
};

class Reading implements IReading {
  datetime = "12345";
  value = 123;

}

export const TimestampedReading = Timestamped(Reading);
export const TimestampedBuilderReading = Builder<Constructor, IReading>(
  TimestampedReading, 
  (builder: IReading) => ({
    ...builder
  })
);


const timestampedReading = TimestampedBuilderReading.build({datetime: "1234", value: 123});

timestampedReading