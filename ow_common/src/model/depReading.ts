import { Maybe, isDefined } from "./Maybe";


export enum ReadingType {
  Any='Any',
  MyWell='MyWell',
  GGMN='GGMN',
}

export type Reading = {
  type: ReadingType.Any;
  datetime: string; //iso formatted string
  value: number;
};


const serialize = (any: ReadingProps) => (): string => {
  return any.name;
  // return function(): string {
  //   return any.name;
  // }
}


interface ReadingProps {
  name: string,
  readingString: Maybe<Function>,
  
}

interface ReadingFuncs<T> {
  serialize: () => string,
}

interface MyWellProps {
  isLegacy: boolean,
  // userId: string,
  // location: Maybe<{
  //   latitude: number,
  //   longitude: number,
  // }>,
  // image: Maybe<{ url: string }>
  mywellString: () => string,
}

interface GGMNProps {

}

// export type MyWellProps = ReadingProps & MyWellProps;
export type MyWellReading = ReadingProps & MyWellProps;
export type GGMNReading = ReadingProps;


/**
 * Implement the ReadingFuncts trait for Something...
 */
function impl<T>(raw: T, functions: ReadingFuncs<T>): ReadingFuncs<T> {
  return {
    ...functions,
    ...raw
  };
}


//TODO: make generic
function combine(obj: ReadingProps & MyWellProps): MyWellReading {

  return {
    serialize: serialize(obj),
    ...obj
  };
}



const mywellReading: MyWellReading = combine({
  name: "1234",
  isLegacy: true,
  readingString: undefined,
  mywellString: () => "HELLLO WORLD",
})

mywellReading.serialize();


// class Component<T> {
//   props: <T>;

//   constructor(props: <T>): void {
//     this.props = props;
//   }
// }

// class MyWellReading extends Component<ReadingProps & MyWellProps> {
  

// }

// export const MyWellReading = compose(
//   ReadingProps, 
//   MyWellProps,
//   SerializeableProps,
// );

// export type MyWellReading = {
//   type: ReadingType.MyWell,
//   datetime: string; //iso formatted string
//   value: number;

//   //MyWell Specific
//   isLegacy: boolean,
//   userId: string,
//   location: Maybe<{
//     latitude: number,
//     longitude: number,
//   }>,
//   image: Maybe<{url: string}>
// }

// export type GGMNReading = {
//   type: ReadingType.Any;
//   datetime: string; //iso formatted string
//   value: number;
// }

