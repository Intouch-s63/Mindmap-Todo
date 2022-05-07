import './App.css';
import React, { useState, useEffect} from 'react';
import ReactDOM from "react-dom";
import MindElixir, { E } from "mind-elixir";
import painter from 'mind-elixir/dist/painter';
import PptxGenJS from "pptxgenjs";
import { Button, Form, Modal} from 'react-bootstrap';
import TodoListDataService from "./services/todo.service";
import Popup from 'reactjs-popup';
import Fab from '@mui/material/Fab';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import hotkeys from 'hotkeys-js';
import AddTodoTag from './AddTodoTag.gif'
import SelectSearch, {fuzzySearch} from 'react-select-search';

var mindstring = '';
let datajson = '';
let updateCheck = false;
let mind = null;



function App() {

  const [Data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [Json,setJson] = useState([])

  

  let selectnode = null;
  let dbnow = null;
  let dbMindmap = null;

  const handleClose = () => setShow(false);
  const handleShow = () => {
    mindstring = mind.getAllData();
    setJson(JSON.stringify(mindstring,null,2))
    setShow(true)
  }

  //สร้างมายแมพ
  useEffect(() => {

    TodoListDataService.getAll()
    .then(response =>{
      if ( response !== null ) {
        dbnow = response.data;
        dbMindmap = response.data;
        var datadb = databaseToJSON(response.data);
        let options = {
          el: "#map",
          direction: MindElixir.LEFT,
          data: datadb,
          draggable: true,
          contextMenu: true,
          toolBar: true,
          nodeMenu: true,
          keypress: true,
          allowUndo: true,
          contextMenuOption: {
            focus: true,
            link: true,
            extend: [
              {
                name: 'Todo Tag',
                onclick: () => {
                  console.log('todotagselectnode ',selectnode)
                  mind.updateNodeTags(selectnode,['Todo'])
                },
              },
              {
                name: 'Delete Tag',
                onclick: () => {
                  console.log('deltagselectnode ',selectnode)
                  mind.updateNodeTags(selectnode,[])
                },
              }
            ],
          },
        }
        mind = new MindElixir(options);

        mind.initSide();
    
        let mindData = mind.getAllDataString();
        console.log(datadb.nodeData)
        setData([]);
        DropdownList(datadb.nodeData)
        console.log(Data)

        hotkeys('t', function(event, handler) {
          event.preventDefault();
          console.log('todotagselectnode ',selectnode)
          if ( selectnode !== undefined && selectnode !== null ) {
            mind.updateNodeTags(selectnode,['Todo'])
            mind.refresh();
          }
        });

        hotkeys('d', function(event, handler) {
          event.preventDefault();
          console.log('deltodoselectnode ',selectnode)
          if ( selectnode !== undefined && selectnode !== null ) {
            mind.updateNodeTags(selectnode,[])
            mind.refresh();
          }
        });
    
        mind.bus.addListener('operation', operation => {
    
          mindstring = mind.getAllData();
    
          //เพิ่ม tags Todo
          if (operation.obj.hasOwnProperty('tags') ) { //ตัวมันเองคือ todo title
            if ( operation.name == 'editTags' || operation.name == 'removeNode' || operation.name == 'finishEdit') {
              if ( operation.obj.tags.includes('Todo') || operation.origin.includes('Todo') ) {
                console.log(operation);
                console.log("====Todo Title trigger====")

                let todoObj = [];
                let mindTodo = mind.getAllData();
                todoObj = getAllTodo(mindTodo.nodeData,todoObj);
                setData([]);
                DropdownList(datadb.nodeData)
                console.log(todoObj);
                exportTodo(todoObj)
              }
            }
          } else if ( !operation.obj.hasOwnProperty('root') && operation.obj.parent.hasOwnProperty('tags') ) { //ตัวมันคือ desc พ่อเป็น todo title
            if ( operation.name == 'removeNode' || operation.name == 'finishEdit' ) {
              if ( operation.obj.parent.tags.includes('Todo') ) {
                console.log(operation);
                console.log("====Todo Desc trigger====")

                let todoObj = [];
                let mindTodo = mind.getAllData();
                todoObj = getAllTodo(mindTodo.nodeData,todoObj);
                setData([]);
                DropdownList(datadb.nodeData)
                console.log(todoObj);
                exportTodo(todoObj)
              }
            }
          }
        })

        mind.bus.addListener('selectNode', node => {
          //console.log('selectnode ',node)
          selectnode = node;
          //console.log(mind.container);
          //console.log(document.getElementsByClassName('box')[0]);
          //console.log(E(node.id));
        })

        mind.bus.addListener('unselectNode', node => {
          selectnode = node;
        })

        setData([]);
        DropdownList(datadb.nodeData)
      }
    })
    .catch(e =>{
      console.log(e);
    })
  },[]);

  //get db ทุกๆ 4 วิ โดยจะต้องไม่ได้กดโนดและไม่ได้ทำการอัพเดท db อยู่
  useEffect(() => {
    const interval = setInterval(() => {
      //console.log('check DB every 3 seconds');
      TodoListDataService.getAll()
      .then(response =>{
        
        if(!(JSON.stringify(response.data) == JSON.stringify(dbMindmap)) && selectnode == undefined && updateCheck == false){
          console.log('update Mindmap');
          console.log(response.data)
          dbMindmap = response.data;
          let dbjson = databaseToJSON(response.data);
          mind.nodeData = dbjson.nodeData;
          setData([]);
          DropdownList(mind.nodeData)
          console.log(Data)
          mind.refresh();

        }
      })
      .catch(e =>{
          console.log(e);
      })
    }, 3000);
  
    return () => clearInterval(interval);
  }, []);

  //Import ไฟล์ JSON แล้ว convert เป็น mindmap
  const importData = (datajson) => {

    updateCheck = true; //ยังไม่ให้อัพเดท db ขณะ import ไฟล์ใหม่

    var obj = JSON.parse(datajson);

    let optionsdata = {
      el: "#map",
      direction: MindElixir.LEFT,
      data: obj,
      draggable: true,
      contextMenu: true,
      toolBar: true,
      nodeMenu: true,
      keypress: true, //true 
      allowUndo: true, //ทำ undo, redo manual เอง
      contextMenuOption: {
        focus: true,
        link: true,
        extend: [
          {
            name: 'Todo Tag',
            onclick: () => {
              console.log('todotagselectnode ',selectnode)
              mind.updateNodeTags(selectnode,['Todo'])
            },
          },
          {
            name: 'Delete Tag',
            onclick: () => {
              console.log('deltagselectnode ',selectnode)
              mind.updateNodeTags(selectnode,[])
            },
          }
        ],
      },
    }

    mind = new MindElixir(optionsdata);

    hotkeys('t', function(event, handler) {
      event.preventDefault();
      console.log('todotagselectnode ',selectnode)
      if ( selectnode !== undefined && selectnode !== null ) {
        mind.updateNodeTags(selectnode,['Todo'])
        mind.refresh();
      }
    });

    hotkeys('d', function(event, handler) {
      event.preventDefault();
      console.log('deltodoselectnode ',selectnode)
      if ( selectnode !== undefined && selectnode !== null ) {
        mind.updateNodeTags(selectnode,[])
        mind.refresh();
      }
    });

    mind.initSide();
    mind.getAllDataString();

    mindstring = mind.getAllData();

    //////////////////อัพเดท db ตามไฟล์ที่ import ทันที///////////

    console.log('Update DB from imported file')

    let todoImport = [];
    let mindImport = mind.getAllData();
    todoImport = getAllTodo(mindImport.nodeData,todoImport);
    console.log(todoImport);
    exportTodo(todoImport)

    /////////////////////////////////////////////////////////

    mind.bus.addListener('operation', operation => {

      console.log(operation);
      mindstring = mind.getAllData();

      console.log(operation);
      mindstring = mind.getAllData();

      //เพิ่ม tags Todo
      if (operation.obj.hasOwnProperty('tags') ) { //ตัวมันเองคือ todo title
        if ( operation.name == 'editTags' || operation.name == 'removeNode' || operation.name == 'finishEdit') {
          if ( operation.obj.tags.includes('Todo') || operation.origin.includes('Todo') ) {
            console.log(operation);
            console.log("====Todo Title trigger====")

            let todoObj = [];
            let mindTodo = mind.getAllData();
            todoObj = getAllTodo(mindTodo.nodeData,todoObj);
            console.log(todoObj);
            exportTodo(todoObj)
          }
        }
      } else if ( !operation.obj.hasOwnProperty('root') && operation.obj.parent.hasOwnProperty('tags') ) { //ตัวมันคือ desc พ่อเป็น todo title
        if ( operation.name == 'removeNode' || operation.name == 'finishEdit' ) {
          if ( operation.obj.parent.tags.includes('Todo') ) {
            console.log(operation);
            console.log("====Todo Desc trigger====")

            let todoObj = [];
            let mindTodo = mind.getAllData();
            todoObj = getAllTodo(mindTodo.nodeData,todoObj);
            console.log(todoObj);
            exportTodo(todoObj)
          }
        }
      }

    })
    mind.bus.addListener('selectNode', node => {
      //console.log('selectnode ',node)
      selectnode = node;
    })
    mind.bus.addListener('unselectNode', node => {
      //console.log('selectnode ',node)
      selectnode = node;
    })
  }

  //Export ไปยัง Database
  const exportTodo = (todoData) => {
    updateCheck = true;
    TodoListDataService.deleteAll()
      .then(response => {
        //console.log('Delete old Todo')
        for (var k = 0 ; k < todoData.length ; k++){

          TodoListDataService.create(todoData[k])
            .then(response => {
                console.log('Add ',response.data);
            })
            .catch(e => {
                console.log(e);
            });
        }
        console.log('wait 2 seconds')
        setTimeout(() => { console.log('wait done');

          TodoListDataService.getAll()
            .then(response => {
              dbMindmap = response.data
              updateCheck = false;
            })
            .catch(e => {
              console.log(e)
            });

        }, 2000);
        //window.alert("Add Todo Completed");
      })
      .catch(e => {
        console.log(e);
        updateCheck = false;
    });
  }

  //แปลง db response.data ทีได้เป็นในรูป mindmap json
  const databaseToJSON = (db) => {
    var dbjson = {
      "nodeData": {
        "id": Date.now()+"root",
        "topic": "Todo",
        "root": true,
        "children": []
      }
    }
    //console.log(dbjson)
    //console.log(db)

    const result = Array.from(new Set(db.map(s => s.title)))
    .map(titles => {
      var desctemp = [];
      var arraytemp = db.filter(s => s.title === titles).map(a => a.description);
      for (let i = 0 ; i < arraytemp.length ; i++) {
        if (arraytemp[i] == null) {

        } else {
          desctemp.push({
            "topic": arraytemp[i],
            "id": Date.now()+arraytemp[i].replace(/ /g,"_")
          })
        }
      }
      return {
        topic: titles,
        id: Date.now()+titles.replace(/ /g,"_"),
        tags: ['Todo'],
        children: desctemp
      }
    })
    //console.log('node add from db',result);
    dbjson.nodeData.children = result;
    //console.log('Mindmap ',dbjson);
    return dbjson;
  }

  //แปลง Mindmap เป็น Todo เฉพาะที่มี tags 'Todo'
  const getAllTodo = (obj,objArray) => {

    for (var i = 0 ; i < obj.children.length ; i++){ //ไล่ทุกลูกของ root => Title Todo

      //console.log(obj.children[i].topic)

      if ( obj.children[i].hasOwnProperty('tags') ) {
        for ( var j = 0 ; j < obj.children[i].tags.length ; j++) {
          if ( obj.children[i].tags[j] == 'Todo' ) {
            if ( !obj.children[i].hasOwnProperty('children') || obj.children[i].children.length == 0){  //ถ้าไม่มีลูกต่อ (Desc) ให้สร้างรายการเลย

              var tododata = 
              {
                title: obj.children[i].topic,
                description: null,
                published: false,
                priority: false,
                duedate: null
              }
              objArray.push(tododata);

            } else {

              for (var j = 0 ; j < obj.children[i].children.length ; j++){

                var tododata = 
                {
                  title: obj.children[i].topic,
                  description: obj.children[i].children[j].topic,
                  published: false,
                  priority: false,
                  duedate: null
                }
                objArray.push(tododata);
                //console.log(tododata);

              }
            }
            break;
          }
        }
      }
    }
    return objArray;
  }

  //Choose File
  const readJSON = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      datajson = e.target.result;
      importData(datajson);
    };
  };

  const goToNode = (width,heigth) => {
    //console.log(mind.container)
    //console.log(10000-(mind.container.offsetWidth/2),10000-(mind.container.offsetHeight/2))
    mind.container.scrollTo(
      width-906.5,
      heigth-271
    )
  }

  var searchString = '';
  var searchTemp = '';
  var retrieveId = [];
  var lastIdCheck = false;
  var foundId = false;

  const DropdownList = (obj) => {
    if (!('children' in obj) || obj.children.length === 0 ){
      if ( !obj.hasOwnProperty('root') ){
        setData(Data => [...Data,{value: obj.id, name: obj.topic}])
      }
    } else { 
      if ( !obj.hasOwnProperty('root') ){
        setData(Data => [...Data,{value: obj.id, name: obj.topic}])
      }
      for (let i = 0 ; i < obj.children.length ; i++){
        DropdownList(obj.children[i])
      }
    }
  }

  const searchNode = (e) => {
   
    console.log(e)
      mind.selectNode(e)

      let xystring = (e).parentElement.parentElement.getAttribute('style');

      if ( xystring == null ){
        xystring = (e).parentElement.parentElement.parentElement.parentElement.getAttribute('style');
      }

      let stringsplit = xystring.split(' ')

      var wpointcheck = false;
      var hpointcheck = false;
      var heigthsplit = stringsplit[1]
      var widthsplit = stringsplit[3]

      if (stringsplit[1].includes('.')){
        heigthsplit = stringsplit[1].split('.')
        heigthsplit = heigthsplit[0]
        hpointcheck = true;
      }
      if (stringsplit[3].includes('.')){
        widthsplit = stringsplit[3].split('.')
        widthsplit = widthsplit[0]
        wpointcheck = true;
      }
      else{
        heigthsplit = stringsplit[1];
        widthsplit = stringsplit[3];
      }
      
      var heightNum = heigthsplit.match(/\d/g).join("");
      var widthNum = widthsplit.match(/\d/g).join("");

      if (hpointcheck){
        heightNum += '.5'
      }
      if (wpointcheck){
        widthNum += '.5'
      }

      goToNode(widthNum,heightNum)
  }

  const JsonPreview = () => {
    mindstring = mind.getAllData();
    console.log(JSON.stringify(mindstring))
    const JsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(mindstring)
    )}`;
  }

  //Export JSON
  const exportData = () => {
    mindstring = mind.getAllData();
    var preJson = JSON.stringify(mindstring)
    console.log(mindstring)
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(mindstring)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";

    link.click();
  };

  //Export Image
  const paint = () => {
    painter.exportPng(mind,'picture');
  }


  return (
    <>
    <div>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Import JSON File</Form.Label>
        <Form.Control type="file" onChange={readJSON}/>
      </Form.Group>
      <div style={{marginBottom:'20px',marginLeft:'5px'}}>
      <SelectSearch
        options={Data}
        onChange = {searchNode}
        search
        filterOptions={fuzzySearch}
        placeholder = "Search node"/>
    </div>
    </div>
    <div >
      <Button variant="outline-secondary" onClick={() => paint()}>Export PNG</Button>{' '}
      <Button variant="outline-success" onClick={handleShow} >Preview JSON</Button>{' '}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>JSON Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body><pre>{Json}</pre></Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      <Button variant="outline-success" onClick={exportData} >Export JSON</Button>{' '}
      <Popup
        trigger={<Fab
            sx={{
              position: "fixed",
              bottom: (theme) => theme.spacing(2),
              right: (theme) => theme.spacing(2)
            }}
            color="secondary" >
            <QuestionMarkIcon />
          </Fab>} modal>
          <div className='container'>
            <div style={{fontWeight: 'bold', textAlign: 'center', marginTop: '15px', fontSize: '30px'}}> Mindmap-Todo </div>
            <br/>
            <div style={{fontWeight: 'bold', textAlign: 'left', marginLeft: '50 px', marginTop: '15px', fontSize: '25px'}}>
              Controls Shortcut
            </div>
            <div style ={{textAlign: 'left', marginBottom: '15px', fontSize: '20px',marginLeft: '100px'}}>
              <br />
             <p> Add a Child: Tab </p>
             <p> Add a sibling: Enter </p>
             <p> Move up: PgUp </p>
             <p> Move down: PgDn </p>
             <p> Add tag Todo: T </p>
             <p> Delete tag Todo: D </p> 
             <br/>
            </div>
            <div style={{fontWeight: 'bold', textAlign: 'left', marginLeft: '70 px', marginTop: '15px', fontSize: '25px'}}>
               Mindmap link to TodoApp
            </div> 
            <div style ={{textAlign: 'left', marginBottom: '15px', fontSize: '20px',marginLeft: '10px',marginRight:'10px'}}>
              <br/>
              <p>This Mindmapp webapp are link to Todolist app
              you can link your content in mindmap to Todolistapp
              by add tag "Todo" to node that you want it to be
              title of your todo list (only work with root child)
              and child of your title will be describtion of your
              todolist
              </p>
              <img  src = {AddTodoTag} alt = "loading. . ."
               style={{width: '425px', height: '100%',border: '10px'}}/>
              <p>You can visit our Todolist App by this link</p>
              <a href={'https://6272d8342f4e2817b3a3e550--todoreactnative-g1.netlify.app/'}>TodoListApp</a>
            </div>
          </div>
      </Popup>
    </div>
    <div id="map" style={{ height: "600px", width: "100%" }} />
    </>
  );
}

export default App;