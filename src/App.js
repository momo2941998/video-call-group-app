import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact >
          <CreateRoom />
        </Route>
        <Route path="/room/:roomID" >
          <Room />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
