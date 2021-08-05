import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ImageBackground, Text, View, Image, 
  Button, TouchableOpacity, TextInput,Platform} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Camera } from 'expo-camera';

import espe from './images/espe.png';
import mask_logo from './images/mask_logo.png';

import * as FaceDetector from 'expo-face-detector';

const blazeface = require('@tensorflow-models/blazeface');
import * as tf from '@tensorflow/tfjs';
import { fetch, bundleResourceIO, cameraWithTensors } from '@tensorflow/tfjs-react-native';

import Svg, {Rect} from 'react-native-svg';
import Canvas from 'react-native-canvas';
import { listModels } from '@tensorflow/tfjs-core/dist/io/model_management';

const TensorCamera = cameraWithTensors(Camera);

const image = espe;
const mask = mask_logo;


function HomeScreen({navigation}) {


  return (
      <View style={styles.container}>
        
      <ImageBackground source={image} style={styles.image}>
      <Text style={styles.text}>Detector</Text>
      <Text style={styles.text}>de</Text>
      <Text style={styles.text}>Mascarrilla</Text>
      <Text></Text>
      <Button
        title="INICIAR"
        onPress={() => navigation.navigate('Camera')}
      />
      <Text></Text>
      <Button
        title="ACERCA DE"
        onPress={() => navigation.navigate('Developers')}
      />

      <StatusBar style="auto" />
      </ImageBackground>
    </View>

  );
}

function CameraScreen() {

  let textureDims;
  if (Platform.OS === 'ios') {
   textureDims = {
     height: 1920,
     width: 1080,
   };
  } else {
   textureDims = {
     height: 1200,
     width: 1600,
   };
  }

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  //Dibujar cara
  const [faces, setFaces] = useState([]);

  //const [maskDetector,setMaskDetector] = useState("");
  //const [faceDetector,setFaceDetector]=useState("");

  const maskDetector = useRef("");
  const faceDetector = useRef("");

  useEffect(() => {
    
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      console.log("[+] Application started")
      //Wait for tensorflow module to be ready
      const tfReady = await tf.ready();
      console.log("[+] Loading custom mask detection model")
      //Replce model.json and group1-shard.bin with your own custom model
      const modelJson = await require("./assets/model/model.json");
      const modelWeight = await require("./assets/model/group1-shard.bin");
      maskDetector.current = await tf.loadLayersModel(bundleResourceIO(modelJson,modelWeight));
      console.log("[+] Loading pre-trained face detection model")
      //Blazeface is a face detection model provided by Google
      console.log("blazeface")
      faceDetector.current =  await blazeface.load();
      //Assign model to variable
      //setMaskDetector(maskDetector);
      //setFaceDetector(faceDetector);
      console.log("[+] Model Loaded");

    })();
  }, []);

  handleCameraStream = async (images, updatePreview, gl) => {

    const loop = async () => {

      var tempArray=[]
      
      const nextImageTensor = images.next().value
      if(faceDetector.current === ""){
        console.log("Cargando...")
      }else{
        //console.log("listo")
        const faces = await faceDetector.current.estimateFaces(nextImageTensor, false);

        console.log(faces);

        for (let i = 0; i < faces.length; i++) {

          // Render a rectangle over each detected face.
          //ctx.fillRect(start[0], start[1], size[0], size[1]);
          
          tempArray.push({
            id:i,
            location:faces[i],
            color:"green"
          })

          setFaces(tempArray)
        }

      }
      
      //
      // do something with tensor here
      //

      // if autorender is false you need the following two lines.
      // updatePreview();
      // gl.endFrameEXP();

      requestAnimationFrame(loop);
    }
    loop();
  
  }

  


  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const flipHorizontal = Platform.OS === 'ios' ? 1 : -1;

  return (
    <View style={styles.cameraContainer}>
      
      <TensorCamera
       // Standard Camera props
       style={styles.camera}
       type={Camera.Constants.Type.front}
       // Tensor related props
       cameraTextureHeight={textureDims.height}
       cameraTextureWidth={textureDims.width}
       resizeHeight={200}
       resizeWidth={152}
       resizeDepth={3}
       onReady={this.handleCameraStream}
       autorender={true}
       >
       </TensorCamera>
      
      <View style={styles.modelresults}>
      <Svg height="100%" width="100%"
        viewBox="0 0 152 200" scaleX={flipHorizontal}>
      {
            faces.map((face)=>{
              return (
              <Rect
                key={face.id}
                x={face.location.topLeft[0]}
                y={face.location.topLeft[1]}
                width={(face.location.bottomRight[0] - face.location.topLeft[0])}
                height={(face.location.bottomRight[1] - face.location.topLeft[1])}
                stroke={face.color}
                strokeWidth="3"
                fill=""
              />
              )
            })
      }  
      </Svg> 

      </View>


    </View>
  );
}

function DevelopersScreen() {
  return (
      
      <View style={styles.container}>
      <ImageBackground source={image} style={styles.image}>
      <Text style={styles.text}>Christopher Briones</Text>
      <Text></Text>
      <Text style={styles.text}>Carlos Clavijo</Text>
      <StatusBar style="auto" />
      </ImageBackground>
    </View>

  );
}


function LoginScreen({navigation}) {
  return (
      
      <View style={styles.container2}>
      <ImageBackground source={image} style={styles.image}>
      
      <View>
        <Image source={mask} style={styles.mask}></Image>
        <Text></Text>
      </View>

      <View>
        <TextInput style={styles.input} placeholder={'username'} placeholderTextColor={'rgb(0, 0, 0)'}></TextInput>
        <Text></Text>
      </View>

      <View>
        <TextInput style={styles.input} placeholder={'contraseña'} placeholderTextColor={'rgb(0, 0, 0)'}></TextInput>
      </View>
      
      <Text></Text>

      <Button
        title="Login"
        onPress={() => navigation.navigate('Home')}
      />
      
      </ImageBackground>
      <StatusBar style="auto" />
      
    </View>

  );
}

const Stack = createStackNavigator();



export default function App() {

  return (

    
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen name="Camera" component={CameraScreen} />

      <Stack.Screen name="Developers" component={DevelopersScreen} />

      <Stack.Screen name="Login" component={LoginScreen} />

    </Stack.Navigator>
  </NavigationContainer>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: '#fff',
    //alignItems: 'center',
    justifyContent: 'center',
  },

  container2: {
    flex: 1,
    backgroundColor: '#D66060',
    //alignItems: 'center',
    justifyContent: "center"
  },

  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },

  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: 'center',
  },

  text: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#000000a0",
    borderRadius: 15,
  },

  camera : {
    position:'absolute',
    left: 50,
    top: 100,
    width: 600/2,
    height: 800/2,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },

  modelresults: {
    position:'absolute',
    left: 50,
    top: 100,
    width: 600/2,
    height: 800/2,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },

  input: {
    fontSize: 30,
    backgroundColor: "#9BF86A",
    borderRadius : 10,
    width: 250,
    textAlign: "center",

  },

});
