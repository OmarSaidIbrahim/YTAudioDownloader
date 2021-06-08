import React, { Component } from 'react'
import { Text, View, TextInput, TouchableOpacity, PermissionsAndroid, Alert, StyleSheet, Image, Animated, Easing } from 'react-native'
import ytdl from 'react-native-ytdl';
import RNFetchBlob from 'rn-fetch-blob';

var animated = false


export default class App extends Component {
  constructor(props){  
    super(props);  

    this.state={
      text: null,
      fadeAnimation: new Animated.Value(0),
      fadeAnimation2: new Animated.Value(0),
      fadeAnimation3: new Animated.Value(0),
      btnClicked: false,
      progressBar: "0%",
      woof: new Animated.Value(1)
    }
  }  

  fadeIn = async() => {
    Animated.timing(animated ? this.state.fadeAnimation2 : this.state.fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(this.fadeOut);
  };

  fadeOut = async() => {
    animated = !animated
    Animated.timing(animated ? this.state.fadeAnimation : this.state.fadeAnimation2, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(animated ? this.fadeIn : null);
  };

  async componentDidMount(){
    await this.introductions();
  }

  homepage = async() => {
    setTimeout(() => {
      Animated.timing(this.state.fadeAnimation3, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 4000);//replace with 4000
  }

  introductions = async () => {
    const a = await this.fadeIn()
    const b = await this.homepage()
  }

  searchAudio = async () => {

    this.setState({btnClicked: true, progressBar: "0%"})

    var URL = this.state.text
    
    URL = "https://www.youtube.com/watch?v="+URL.split(".be/")[1];

    const downloadURLsToFile = (URLs, path, progressCallback) =>
      new Promise(async (resolve, reject) => {

        for (let i = 0; i < URLs.length; i++) {
          let {url, headers} = URLs[i];

          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'App needs access to external storage to download the file',
              }
            );
        
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert(
                'Permission Denied!',
                'You need to give storage permission to download the file'
              );
              return;
            }
            Alert.alert('Permission granted', 'Permission has been granted!');
            
            const fileAlreadyExists = await RNFetchBlob.fs.exists(path);
            if (fileAlreadyExists) {
              await RNFetchBlob.fs.unlink(path);
            }

            const res = await RNFetchBlob.config({
              path,
              overwrite: false,
            }).fetch('GET', url, headers)
              .progress((received, total) => {
                if (progressCallback) {
                  progressCallback((received * (i + 1)) / (total * URLs.length));
                }
              })
              .catch(err => console.error(`Could not save:"${path}" Reason:`, err));

            const contentType = res.respInfo.headers['Content-Type'];
            
            if (contentType) {
              const extension = "mp3";
              path = `${path}.${extension}`;
              await RNFetchBlob.fs.mv(res.path(), path);
            }
            this.setState({progressBar: "100%"})

            console.log('The file is saved to:', path);

          } catch (e) {
            console.error(e);
            reject(e);
          }

        }
        resolve(path);
      });

    const testDownloadableURLIsSavedToFile = async () => {
      /**
       * Just Testing ytdl(, {quality:'highestaudio'}) will implicitly test the following as well:
       * - ytdl.chooseFormat()
       * - ytdl.getInfo()
       * - ytdl.getBasicInfo()
       */
      const downloadableURLs = await ytdl(URL, { quality: 'highestaudio' });
      const path = RNFetchBlob.fs.dirs.DownloadDir + '/'+URL.split("v=")[1]; //file name could be replaced with video title (getInfo)
      const savedPath = await downloadURLsToFile(downloadableURLs, path,
        (progress) => this.setState({progressBar: (progress*100).toFixed()+"%"}));
    };
    //check if video exists
    //insert progress bar
    await testDownloadableURLIsSavedToFile();
    Animated.timing(this.state.woof, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      this.setState({progressBar: "Woof!"})
      Animated.timing(this.state.woof, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
    
  };

  render() {
    return (
      <View style={styles.container}>

        <Animated.View style={{opacity: this.state.fadeAnimation, justifyContent: "center", alignItems: "center"}}>
          <Image
            style={styles.logo}
            source={require('./images/my-icon.png')}
          />
          <Text style={styles.headline}>A doggo development{"\n"}presents</Text>
        </Animated.View>

        <Animated.View style={{opacity: this.state.fadeAnimation2, justifyContent: "center", alignItems: "center", position: "absolute"}}>
        <Image
            style={styles.background}
            source={require('./images/background-image.png')}
          />
        </Animated.View>
        
        <Animated.View style={{opacity: this.state.fadeAnimation3, justifyContent: "center", alignItems: "center", position: "absolute", flexDirection: "column"}}>
          <Image
            style={styles.logo2}
            source={require('./images/my-icon.png')}
          />
          <Text style={styles.headline2}> Enter the youtube link below </Text>
          <TextInput
            onChangeText={(text) => this.setState({ text })}
            value={this.state.text}
            placeholder="Enter link here..."
            style={styles.inputBar}
          />
          <TouchableOpacity onPress={this.searchAudio} style={styles.searchButton}>
            <Text style={{color: "white"}}>Search</Text>
          </TouchableOpacity>

          {this.state.btnClicked ? 
          <View style={{alignItems:"center"}}>

            <View style={{width: 150, height: 150, borderRadius: 150/2, borderWidth: 1, borderColor: "black", justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
              <Animated.Text style={{fontSize: 50, textAlign: "center", fontFamily: "Microsoft Sans Serif", opacity: this.state.woof}}>{this.state.progressBar}</Animated.Text>
            </View>
            
          </View>
          : null}
          
        </Animated.View> 
      </View> 
      
    )
    {/**/}
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: "center",
    backgroundColor: "white"
  },
  logo: {
    width: 180,
    height: 150,
    marginVertical: "20%"
  },
  logo2: {
    width: 150, 
    height: 120,
    marginVertical: "10%"
  },
  headline: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Microsoft Sans Serif",
  },
  headline2: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "Microsoft Sans Serif",
  },
  background: {
    width: 500,
    height: 500
  },
  searchButton: {
    padding: 10,
    backgroundColor: "black",
    width: 100,
    alignItems: "center",
    marginVertical: 10
  },
  inputBar: {
    borderWidth: 1,
    borderColor: "black",
    width: "90%",
    marginTop: 20
  }
})