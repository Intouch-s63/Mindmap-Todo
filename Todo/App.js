import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl} from 'react-native';
import { NavigationContainer, useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, Avatar, Searchbar, Button, Portal, Provider, TextInput, Text, Dialog, Checkbox, Card, Paragraph } from 'react-native-paper';
import 'react-native-gesture-handler';
import TodoListDataService from "./services/todo.service"

//const [, forceUpdate] = React.useReducer(x => x + 1, 0);

const theme = {
  colors: {
    primary: '#2196f5',
  },
};

var dbtemp = null;
var dbCheck = false;

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


function NowScreen({ navigation }) {

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  //////////Initial//////////

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  //1
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('check DB every 3 seconds');
      TodoListDataService.getAll()
        .then(response =>{
            if(!(JSON.stringify(response.data) == JSON.stringify(dbtemp)) && dbCheck == false){
              console.log('UPDATE DB (Mindmap changes)')
              setTodoSearch(response.data);
              setDataShow(response.data);
              console.log(DataShow.length);
              setNotFound(false);
              setSearchQuery();
              dbtemp = response.data;
            } else {
              setNotFound(true);
            }
        })
        .catch(e =>{
            console.log(e);
        })
      }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [DataShow, setDataShow] = useState([]);

  const retrieveTodo = () =>{
    console.log('========retrieveTodo=======')
    TodoListDataService.getAll()
    .then(response =>{
        if(response.data){
          setTodoSearch(response.data);
          setDataShow(response.data);
          console.log(DataShow.length);
          setNotFound(false);
          setSearchQuery();
          dbtemp = response.data; //1
          dbCheck = false; //1
        } else {
          setNotFound(true);
        }
    })
    .catch(e =>{
        console.log(e);
    })
  }

  React.useEffect(()=>{
    console.log('Now component called for the first time');
    retrieveTodo();
  },[])

  //////////DatetimePicker//////////
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };
  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };
  const showDatepicker = () => {
    showMode('date');
  };
  const showTimepicker = () => {
    showMode('time');
  };

  //////////Searchbar//////////
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [todoSearch,setTodoSearch] = useState([]);

  const onChangeSearch = query => {

    const searchData = todoSearch.filter((todo) => {
      const todo_data = `${todo.title.toUpperCase()})`;
      const text_data = query.toUpperCase();
      return todo_data.indexOf(text_data) > -1;
    })
    setSearchQuery(query)
    console.log(searchData)
    setDataShow(searchData)

    if (DataShow.length == 0) {
      setNotFound(true);
    } else {
      setNotFound(false);
    }
  }

  //////////AddTodo//////////
  const [titleAdd, setTitleAdd] = useState();
  const [descAdd, setDescAdd] = useState();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleAddTodo = (date) => {
    console.log(titleAdd);
    var data = 
    {
      title: titleAdd,
      description: descAdd,
      published: false,
      priority: false,
      duedate: date
    }
    setTitleAdd(null);
    setDescAdd(null);
    setDate(new Date(Date.now()))

    dbCheck = true; //1
    TodoListDataService.create(data)
        .then(response => {
            console.log('Add',response.data);
            retrieveTodo();
        })
        .catch(e => {
            console.log(e);
        });
  }

  //////////EditTodo//////////
  const [titleEdit, setTitleEdit] = useState();
  const [descEdit, setDescEdit] = useState();
  const [todoEdit, setTodoEdit] = useState();
  const [isDialogVisibleEdit, setIsDialogVisibleEdit] = useState(false);

  const handleEdit = (date) => {
    var data = 
    {
      title: titleEdit,
      description: descEdit,
      published: todoEdit.published,
      priority: todoEdit.priority,
      duedate: date
    }
    
    dbCheck = true; //1
    TodoListDataService.update(todoEdit.id,data)
      .then(response => {
          console.log('Edit', response.data);
          setTitleEdit(null);
          setDescEdit(null);
          setTodoEdit(null);
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  //////////DeleteTodo//////////
  const [todoDelete, setTodoDelete] = useState();
  const [isDialogVisibleDelete, setIsDialogVisibleDelete] = useState(false);

  const handleDelete = (todo) => {
    dbCheck = true; //1
    TodoListDataService.delete(todo.id)
    .then(response => {
        console.log('Delete',response.data);
        setTodoDelete(null);
        retrieveTodo();
    })
    .catch(e => {
        console.log(e);
    });
  }

  //////////ViewTodo//////////
  const [isDialogVisibleView, setIsDialogVisibleView] = useState(false);
  const [titleView, setTitleView] = useState()
  const [descView, setDescView] = useState()

  //////////CheckCompleteTodo//////////

  const checkbox = (todo) => 
  <Checkbox accessibilityLabel='Checkbox'  status={todo.published ? 'checked' : 'unchecked'} onPress={() => [handleComplete(todo)]} color='#2196f5' />

  const handleComplete = (todo) => {
    var data = 
    {
      title: todo.title,
      description: todo.description,
      published: !todo.published,
      priority: todo.priority,
      duedate: todo.duedate
    }
    dbCheck = true; //1
    TodoListDataService.update(todo.id,data)
      .then(response => {
          console.log('click Completed',response.data);
          //forceUpdate();
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  //////////StarTodo//////////
  const star = (todo) => 
  <TouchableOpacity accessibilityLabel='Star' style={[{marginRight: 20,justifyContent:'center'}]} onPress={() => [handleStarClick(todo)]}>
  {todo.priority ?
    <Image accessibilityLabel='truestar' style={{height:27,width:27}} source={require('./pictures/goldstar.png')}></Image>
    : <Image accessibilityLabel='falsestar' style={{height:27,width:27}} source={require('./pictures/transstar.png')}></Image>}
  </TouchableOpacity>

  const handleStarClick = (todo) => {
    var data = 
    {
      title: todo.title,
      description: todo.description,
      published: todo.published,
      priority: !todo.priority,
      duedate: todo.duedate
    }
    dbCheck = true; //1
    TodoListDataService.update(todo.id,data)
      .then(response => {
          console.log('click Star',response.data);
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      console.log('Tab change UPDATE (Now Tab)')
      retrieveTodo();
    });

    return unsubscribe;
  }, [navigation]);

  return (
      <Provider>
        <View style={styles.mainbox}>
          <Searchbar accessibilityLabel='Search' placeholder="Search" onChangeText={onChangeSearch} value={searchQuery} />
        </View>

        <ScrollView style={{marginBottom: 50}} refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />}>
          {DataShow.map((todo, index) => {
            return (
              <View key ={index} style={styles.container} accessibilityLabel='Todo'>
                <Card>
                  <Card.Title  title={todo.title} subtitle={todo.description} left={() => checkbox(todo)}  right={() => star(todo)}/>
                  <Card.Actions>
                    <Button accessibilityLabel='Detail' theme={theme} onPress={() => [setTitleView(todo.title),setDescView(todo.description),setIsDialogVisibleView(true)]}>View Details</Button>
                    <Button accessibilityLabel='Edit' color='green' onPress={() => [setTitleEdit(todo.title),setDescEdit(todo.description),setTodoEdit(todo),setIsDialogVisibleEdit(true)]}>Edit</Button>
                    <Button accessibilityLabel='Delete' color='red' onPress={() => [setTodoDelete(todo),setIsDialogVisibleDelete(true)]}>Delete</Button>
                  </Card.Actions>
                </Card>   
              </View>
            );
          })}
          {notFound == true ?
                <View>
                  <Text style={{textAlign: 'center',}}>Not found</Text>
                </View> 
                : null}
        </ScrollView>

        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
            <Dialog.Title>ADD NEW TO DO</Dialog.Title>
            <Dialog.Content>
              <TextInput accessibilityLabel='AddTitle' label='Title' placeholder='Title...' onChangeText={text => setTitleAdd(text)} mode="outlined" theme={theme} />
            </Dialog.Content>
            <Dialog.Content>
              <TextInput accessibilityLabel='AddDesc' label='Detail' placeholder='Description...' onChangeText={text => setDescAdd(text)} mode="outlined" theme={theme} />
            </Dialog.Content>
            <Dialog.Content>
              <Button accessibilityLabel='AddDate' onPress={showDatepicker} mode='outlined' color='#ff6347'> Pick Due Date </Button>
            </Dialog.Content>
            <Dialog.Content>
              <Button accessibilityLabel='AddTime' onPress={showTimepicker} mode='outlined'color='#ff6347'> Pick Due Time </Button>
            </Dialog.Content>
            <Dialog.Content>
            <Text style={[styles.todotext,{textAlign: 'center',marginTop: 5, marginBottom: 5,}]}>Selected: {date.toLocaleString()}</Text>
            </Dialog.Content>

            <Dialog.Actions>
              <Button accessibilityLabel='AddSubmit' onPress={() => [handleAddTodo(date.toLocaleString()),setIsDialogVisible(false)]} theme={theme}>ADD</Button>
            </Dialog.Actions>

          </Dialog>
          <View style={styles.addButton} >
            <Button  accessibilityLabel='Add' color='#2196f5' icon="plus" mode="contained" onPress={() => setIsDialogVisible(true)}> Add New To Do </Button>
          </View>
        </Portal>

        <Portal>
          <Dialog visible={isDialogVisibleView} onDismiss={() => [setTitleView(),setDescView(),setIsDialogVisibleView(false)]}>
            <Dialog.Title>{titleView}</Dialog.Title>
            <Dialog.Content>
              <Paragraph accessibilityLabel='desc'>{descView}</Paragraph>
            </Dialog.Content>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={isDialogVisibleDelete} onDismiss={() => setIsDialogVisibleDelete(false)}>
            <Dialog.Title>Are you sure delete?</Dialog.Title>
            <Dialog.Actions>
              <Button onPress={() => [setIsDialogVisibleDelete(false),setTodoDelete(null)]} theme={theme} >Cancel</Button>
              <Button accessibilityLabel='DeleteConF' onPress={() => [handleDelete(todoDelete),setIsDialogVisibleDelete(false),setTodoDelete(null)]} color='red' >Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={isDialogVisibleEdit} onDismiss={() => setIsDialogVisibleEdit(false)}>
            <Dialog.Title>EDIT TO DO</Dialog.Title>
            <Dialog.Content>
              <TextInput accessibilityLabel='EditTitle' label='Title' value={titleEdit} onChangeText={text => setTitleEdit(text)} mode="outlined" theme={theme} />
            </Dialog.Content>
            <Dialog.Content>
              <TextInput accessibilityLabel='EditDesc' label='Detail' value={descEdit} onChangeText={text => setDescEdit(text)} mode="outlined" theme={theme} />
            </Dialog.Content>
            <Dialog.Content>
              <Button accessibilityLabel='EditDate' onPress={showDatepicker} mode='outlined' color='#ff6347'> Pick Due Date </Button>
            </Dialog.Content>
            <Dialog.Content>
              <Button accessibilityLabel='EditTime' onPress={showTimepicker} mode='outlined'color='#ff6347'> Pick Due Time </Button>
            </Dialog.Content>
            <Dialog.Content>
            <Text style={[styles.todotext,{textAlign: 'center',marginTop: 5, marginBottom: 5,}]}>Selected: {date.toLocaleString()}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button accessibilityLabel='Save' onPress={() => [handleEdit(date.toLocaleString()),setIsDialogVisibleEdit(false)]} theme={theme}>Save Change</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Provider>
      
    
  );
}

function CompletedScreen({ navigation }) {
  
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
 
  //////////Initial//////////

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    retrieveTodo();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const [notFound, setNotFound] = useState([]);
  const [DataShow, setDataShow] = useState([]);

  const retrieveTodo = () => {
    console.log('========retrieveTodo=======')
    TodoListDataService.getAll()
      .then(response =>{
          const completedTodo = response.data.filter((todo) => todo.published == 1);
          setDataShow(completedTodo);
          if(completedTodo.length == 0){
            setNotFound(true);
          } else {
            setNotFound(false);
          }
          console.log(DataShow.length);
          //forceUpdate();
      })
      .catch(e =>{
          console.log(e);
      })
    } 

  React.useEffect(()=>{
    console.log('Completed component called for the first time');
    retrieveTodo();
    //forceUpdate();
  },[])

  //////////DatetimePicker//////////
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };
  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };
  const showDatepicker = () => {
    showMode('date');
  };
  const showTimepicker = () => {
    showMode('time');
  };

  //////////EditTodo//////////
  //const [inputValEdit, setInputValEdit] = useState();
  const [titleEdit, setTitleEdit] = useState();
  const [descEdit, setDescEdit] = useState();
  const [todoEdit, setTodoEdit] = useState();
  const [isDialogVisibleEdit, setIsDialogVisibleEdit] = useState(false);

  const handleEdit = (date) => {
    var data = 
    {
      title: titleEdit,
      description: descEdit,
      published: todoEdit.published,
      priority: todoEdit.priority,
      duedate: date
    }
    
    TodoListDataService.update(todoEdit.id,data)
      .then(response => {
          console.log('Edit', response.data);
          setTitleEdit(null);
          setDescEdit(null);
          setTodoEdit(null);
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  //////////DeleteTodo//////////
  const [todoDelete, setTodoDelete] = useState();
  const [isDialogVisibleDelete, setIsDialogVisibleDelete] = useState(false);

  const handleDelete = (todo) => {
    TodoListDataService.delete(todo.id)
    .then(response => {
        console.log('Delete',response.data);
        setTodoDelete(null);
        retrieveTodo();
    })
    .catch(e => {
        console.log(e);
    });
  }

  //////////ViewTodo//////////
  const [isDialogVisibleView, setIsDialogVisibleView] = useState(false);
  const [titleView, setTitleView] = useState()
  const [descView, setDescView] = useState()

  //////////CheckCompleteTodo//////////

  const checkbox = (todo) => 
  <Checkbox accessibilityLabel='CheckboxCompleted' status={todo.published ? 'checked' : 'unchecked'} onPress={() => [handleComplete(todo)]} color='#2196f5' />

  const handleComplete = (todo) => {
    var data = 
    {
      title: todo.title,
      description: todo.description,
      published: !todo.published,
      priority: todo.priority,
      duedate: todo.duedate
    }
    TodoListDataService.update(todo.id,data)
      .then(response => {
          console.log('click Completed',response.data);
          //forceUpdate();
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  //////////StarTodo//////////
  const star = (todo) => 
  <TouchableOpacity style={[{marginRight: 20,justifyContent:'center'}]} onPress={() => [handleStarClick(todo)]}>
  {todo.priority ?
    <Image style={{height:27,width:27}} source={require('./pictures/goldstar.png')}></Image>
    : <Image style={{height:27,width:27}} source={require('./pictures/transstar.png')}></Image>}
  </TouchableOpacity>

  const handleStarClick = (todo) => {
    var data = 
    {
      title: todo.title,
      description: todo.description,
      published: todo.published,
      priority: !todo.priority,
      duedate: todo.duedate
    }
    TodoListDataService.update(todo.id,data)
      .then(response => {
          console.log('click Star',response.data);
          retrieveTodo();
      })
      .catch(e => {
          console.log(e);
      });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      console.log('Tab change UPDATE (Completed Tab)')
      retrieveTodo();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Provider>

      <ScrollView style={{marginBottom: 50}} refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />}>
        {DataShow.map((todo, index) => {
          return (
            <View key ={index} style={styles.container} accessibilityLabel='CompletedTodo'>
              <Card>
                <Card.Title title={todo.title} subtitle={todo.description} left={() => checkbox(todo)}/>
                <Card.Actions>
                  <Button theme={theme} onPress={() => [setTitleView(todo.title),setDescView(todo.description),setIsDialogVisibleView(true)]}>View Details</Button>
                  <Button accessibilityLabel='DeleteCompletedTodo' color='red' onPress={() => [setTodoDelete(todo),setIsDialogVisibleDelete(true)]}>Delete</Button>
                </Card.Actions>
              </Card>   
            </View>
          );
        })}
        {notFound == true ?
              <View>
                <Text style={{textAlign: 'center',}}>Not found</Text>
              </View> 
              : null}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisibleView} onDismiss={() => [setTitleView(),setDescView(),setIsDialogVisibleView(false)]}>
          <Dialog.Title>{titleView}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{descView}</Paragraph>
          </Dialog.Content>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={isDialogVisibleDelete} onDismiss={() => setIsDialogVisibleDelete(false)}>
          <Dialog.Title>Are you sure delete?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => [setIsDialogVisibleDelete(false),setTodoDelete(null)]} theme={theme} >Cancel</Button>
            <Button accessibilityLabel='DeleteCompletedTodoConF' onPress={() => [handleDelete(todoDelete),setIsDialogVisibleDelete(false),setTodoDelete(null)]} color='red' >Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={isDialogVisibleEdit} onDismiss={() => setIsDialogVisibleEdit(false)}>
          <Dialog.Title>EDIT TO DO</Dialog.Title>
          <Dialog.Content>
            <TextInput label='Title' value={titleEdit} onChangeText={text => setTitleEdit(text)} mode="outlined" theme={theme} />
          </Dialog.Content>
          <Dialog.Content>
            <TextInput label='Detail' value={descEdit} onChangeText={text => setDescEdit(text)} mode="outlined" theme={theme} />
          </Dialog.Content>
          <Dialog.Content>
            <Button onPress={showDatepicker} mode='outlined' color='#ff6347'> Pick Due Date </Button>
          </Dialog.Content>
          <Dialog.Content>
            <Button onPress={showTimepicker} mode='outlined'color='#ff6347'> Pick Due Time </Button>
          </Dialog.Content>
          <Dialog.Content>
          <Text style={[styles.todotext,{textAlign: 'center',marginTop: 5, marginBottom: 5,}]}>Selected: {date.toLocaleString()}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => [handleEdit(date.toLocaleString()),setIsDialogVisibleEdit(false)]} theme={theme}>Save Change</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}

function CustomNavigationBar() {
  return (
    <Appbar.Header theme={theme}>
        <Appbar.Content title="ToDo App" subtitle="Kornsakon Dumrongkullanit" />
        <Avatar.Image size={40} source={require('./assets/images/4.png')}  />
      </Appbar.Header>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Now" screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Now') {
              iconName = focused ? 'alarm' : 'alarm';
            } else if (route.name === 'Completed') {
              iconName = focused ? 'checkmark' : 'checkmark';
            } 
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196f5',
          tabBarInactiveTintColor: 'gray',
          header: CustomNavigationBar,
        })}>
        <Tab.Screen tabBarAccessibilityLabel='NowTab' name="Now" component={NowScreen} />
        <Tab.Screen tabBarAccessibilityLabel='CompleteTab' name="Completed" component={CompletedScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
  },
  mainbox: {
    textAlign:'center',
    margin: 15,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addButton: {
    right: 10,
    left: 10,
    position: 'absolute',
    bottom: 10,

  }
});