import { hot } from "@nodegui/react-nodegui";
import WindowHandler from "./components/windowHandler"
import React from "react"
import {tc} from "./connect"

const App = () => {
	tc("root@192.168.1.22")
	return (
		<WindowHandler />
	);
}


export default hot(App);
