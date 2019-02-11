

// const serde = (thing: T) {
//   serialize: () => "Serialize",
//   deserialize: (thing: string) =>  
// }

type Serialize<T> = {
  serialize: () => (thing: T) => string,
  // deserialize: (thing: string) => () =>  T,
}



type ReadingProps = {
  value: number,
  name: string,
}

type MyWellReadingProps = {
  isLegacy: boolean,
}


//eg implement trait "Serde" for Reading
const ReadingSerde: Serialize<ReadingProps> = {
  serialize: () => (thing: ReadingProps) => `${thing.name}, ${thing.value}`,
  // deserialize: (thing: string) => () => ({value: 123, name: "lewis"})
}

//eg implement trait "Serde" for MyWellReading
const MyWellReadingSerde: Serialize<ReadingProps & MyWellReadingProps> = {
  serialize: () => (thing: ReadingProps & MyWellReadingProps) => `${thing.name}, ${thing.value}`,
  // deserialize: (thing: string) => () => ({ value: 123, name: "lewis", isLegacy: true})
}

const Reading = (props: ReadingProps): ReadingProps & Serialize<ReadingProps> => ({
  ...props,
  ...ReadingSerde
});

const MyWellReading = (props: ReadingProps & MyWellReadingProps): ReadingProps & MyWellReadingProps & Serialize<ReadingProps & MyWellReadingProps> => ({
  ...props,
  ...MyWellReadingSerde,
});




const myReading = Reading({value: 123, name: "1234"});
const myWellReading = MyWellReading({value: 123, name: "1234", isLegacy: true});
myWellReading.serialize();