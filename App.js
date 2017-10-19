import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  ActivityIndicator,
  ListView,
  StyleSheet
} from 'react-native';
import { StackNavigator} from 'react-navigation';
import {
  Button,
  Text,
  Container,
  Content,
  List,
  ListItem,
  Thumbnail,
  Body,
} from 'native-base';

var countryMaster = require('./country.json');

const ITUNES_RSS_URL = "https://rss.itunes.apple.com/api/v1/";
const ITUNES_MUSIC_TOP_ALBUMS_URL = "/itunes-music/top-albums/100/explicit/json";
const URL_SEPARATOR = ".";
const SSL_URL_SUFFIX = "-ssl";

class HomeScreen extends Component {
  static navigationOptions = {
      title: 'Namaste',
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: countryMaster,
    };
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Container>
        <Content>
          <List
            dataArray={this.state.dataSource}
            renderRow={(rowData) =>
              <ListItem>
                <Body>
                  <View style={ styles.button }>
                    <Button block onPress = { () => navigate('List', { country: rowData.code }) }>
                      <Text>{rowData.country}</Text>
                    </Button>
                  </View>
                </Body>
              </ListItem>
            }
          />
        </Content>
      </Container>
    );
  }
}

class ListScreen extends Component {
  static navigationOptions = ({
    title: "Itunes Albums Top 100",
  })
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      countryCode: this.props.navigation.state.params.country
    }
  }
  componentDidMount() {
    return fetch(ITUNES_RSS_URL + this.state.countryCode + ITUNES_MUSIC_TOP_ALBUMS_URL)
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: responseJson.feed.results,
        }, function() {
          // something
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <Container>
        <Content>
          <List
            dataArray={this.state.dataSource}
            renderRow={(rowData) =>
              <ListItem>
                <Thumbnail square size={80} source={{ uri: convertHttpToHttps(rowData.artworkUrl100) }} />
                <Body>
                  <Text>{rowData.name}</Text>
                  <Text note>{rowData.artistName}</Text>
                  <Text note style={{ fontWeight: 'bold', fontSize: 10 }}>{removeMusicFromGenre(rowData.genreNames)}</Text>
                </Body>
              </ListItem>
            }
          />
        </Content>
      </Container>
    );
  }
}

const navigation = StackNavigator({
    Home: {screen: HomeScreen},
    List: {screen: ListScreen},
});

var styles = StyleSheet.create({
  button: {
    marginBottom: 10,
  },
});

var convertHttpToHttps = function(imgUrl) {
  var arrayOfImageUrl = imgUrl.split(URL_SEPARATOR);
  arrayOfImageUrl[0] = arrayOfImageUrl[0].replace(/http/g, "https") + SSL_URL_SUFFIX;
  return arrayOfImageUrl.join(URL_SEPARATOR);
};

var removeMusicFromGenre = function(genres) {
  return genres.join(" ").replace(/ミュージック|Music/g, "").split(" ").filter(function(e) { return e }).join(",");
};


AppRegistry.registerComponent('navigation', () => navigation);
