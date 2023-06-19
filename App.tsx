import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Image, TouchableWithoutFeedback, Keyboard} from 'react-native';

type elementType = {
  id: number,
  number?: number,
  category: string,
  name: string,
  title: string
  content: string[]
}

type searchType = {
  bar: string,
  parsed: string,
}


export default function App() {
  const [search, setSearch] = useState<searchType>({ bar: '', parsed: ''})
  const [last, setLast ] = useState('')
  const [location, setLocation] = useState(0)
  const [active, setActive ] = useState({ activeIndex: -1 })
  const [viewList, setViewList ] = useState<elementType[]>([])
const [arr, setArr ] = useState([])

useEffect(() => {
  fetchNews();
}, [])

const fetchNews = async () => {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    await fetch('https://api.chiptree.pl/api/courses/list', requestOptions)
      .then(response => response.json())
      .then(data => {
        setArr(data);
      });
  } catch (error) {
    console.log(error);
  }
}

  const goActive = (id: number) => {
    setActive({ activeIndex:  id })
    setLocation(2)

    return

  }
  const goHome = () => {
    console.log("Change location", location, active.activeIndex)
    setActive({ activeIndex: -1 })
    setLocation(0)
  }

  const searchAlgo = () => {
    fetchNews()
    Keyboard.dismiss();
    setLocation(1);
    setLast(search.bar)
    if (search.parsed.length > 0) {
      let result: elementType[] = []
      for (let i = 0; i <= arr.length - 1; i++) {
        if (arr[i].content !== undefined) {
          let joinedStrings = arr[i].name + arr[i].content.join()
          let parsed = joinedStrings.toLowerCase().replace(/\s/g, '');
          if (parsed.indexOf(search.parsed) !== -1 ) {
            result.push(arr[i])
          }
        }
      }
      setViewList(result)
      setSearch({ bar: '', parsed: ''})
    } else {
      setViewList(arr)
    }
  }

  const handleInputChange = (text: string) => {
    let parsed = text.toLowerCase().replace(/\s/g, '');
    setSearch({ bar: text, parsed: parsed });
  };

  const ElementGenerator = (props: elementType ) => {

    const stepList = props.content?.map((item, index) => <Text style={styles.stepText} >{index + 1}. {item}</Text>)
    return(
      <TouchableWithoutFeedback onPress={() => goActive(props.id)}>
        <View style={styles.elementContainer} >
          <View style={styles.elementTitle}>
            <Text style={styles.elementTitleText}>{props.number}. {props.title}</Text>
          </View>
          <View style={styles.stepContainer}>
            {stepList}
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  const ActiveViewGenerator = (id: number) => {
    let result: elementType[] = arr.filter(x => x.id == id )
    let matched = result[0]

    const stepList = matched.content?.map((item, index) => <Text style={styles.stepText} >{index + 1}. {item}</Text>)

    return(
      <View style={styles.activeViewContainer}>
        <View style={styles.homeTextContainer}>
          <Text style={styles.homeText}>
            {matched.title}
          </Text>
        </View>
        <View style={styles.activeViewStepList}>
          {stepList}
        </View>
      </View>
    )
  }

  const elementList = viewList.map((item, index) => <ElementGenerator key={index} number={index + 1} id={item.id} category={item.category} name={item.name} title={item.title} content={item.content} />)

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        { active.activeIndex == -1 ?
          <TouchableWithoutFeedback onPress={() => goHome()} accessible={false}>
            <View style={styles.homeContainer}>
              <Image
                source={require('./assets/home.png')}
                style={styles.homeImg}
              />
            </View>
          </TouchableWithoutFeedback>
         :
         <TouchableWithoutFeedback onPress={() => setActive({activeIndex: -1})} accessible={false}>
         <View style={styles.homeContainer}>
           <Image
             source={require('./assets/arrow-left.png')}
             style={styles.homeImg}
           />
         </View>
       </TouchableWithoutFeedback>
        }
        <TextInput
          style={styles.searchInput}
          onChangeText={handleInputChange}
          value={search.bar}
          placeholder='Enter the phraze...'
          onSubmitEditing={() => searchAlgo()}
        />
        <TouchableWithoutFeedback onPress={() => searchAlgo()} accessible={false}>
          <View style={styles.loopContainer}>
            <Image
              source={require('./assets/loop.png')}
              style={styles.loopImg}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      { active.activeIndex !== -1 && location == 2
      ?
        <View style={styles.activeViewContainer}>
          {ActiveViewGenerator(active.activeIndex)}
        </View>
      : ( active.activeIndex === -1 && location == 0 ?
        <View style={styles.mainWrapper}>
          <View style={styles.homeTextContainer}>
            <Text style={styles.homeText}>Home</Text>
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.textWelcome} >Welcome on Macksera</Text>
          </View>
        </View>
        :
        <ScrollView style={styles.content} keyboardShouldPersistTaps='handled' >
          <View style={styles.elementListContainer}>
            {elementList.length == 0 ?
              <Text style={styles.sorryText} >Sorry, no match for phraze "{last}" found...</Text> :
              elementList
            }
            <StatusBar style="auto" />
          </View>
        </ScrollView> )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navbar: {
    paddingTop: '10%',
    backgroundColor: '#3b4bdb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: '16%'
  },

  mainWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  welcomeContainer: {
    display: 'flex',
    marginTop: 20,
    width: '90%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    borderWidth: 5,
    borderColor: '#3b4bdb'
  },

  textWelcome: {
    fontSize: 45,
    textAlign: 'center'
  },

  homeContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#fcba03',
    zIndex: 100,
    marginRight: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },

  lastCheckedContainer: {
    height: '50%',
    width: '90%'
  },

  homeImg: {
    width: 25,
    height: 25
  },

  loopContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#fcba03',
    marginLeft: -30,
    zIndex: 100,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },

  loopImg: {
    width: 37,
    height: 37
  },

  searchInput: {
    backgroundColor: '#fff',
    width: '70%',
    height: 50,
    borderRadius: 15,
    padding: '2%'
  },

  content: {
    width: '100%'
  },

  homeTextContainer: {
    width: '100%',
    backgroundColor: '#fcba03',
  },

  homeText: {
    padding: 10,
    fontSize: 29,
    fontWeight: '500',
  },

  sorryText: {
    paddingTop: '10%',
    fontSize: 30,
    textAlign: 'center',
    color: '#bbbfbc'
  },

  elementListContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  elementContainer: {
    minHeight: 200,
    borderRadius: 15,
    marginTop: '6%',
    backgroundColor: '#e3dfd5',
    width: '90%',
    overflow: 'hidden'
  },

  elementTitle: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fcba03',
    borderRadius: 15,
  },

  elementTitleText: {
    fontSize: 19,
    fontWeight: '700'
  },

  stepContainer: {
    padding: 10,
  },
  stepText: {
    fontSize: 17,
    fontWeight: '400'
  },

  activeViewContainer: {
    width: '100%'
  },

  activeViewStepList: {
    padding: 10,
  }
});
