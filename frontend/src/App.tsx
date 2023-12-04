// Note this is APP SPECIFIC css not included in our sitewide index.css
import Home from './components/Home';
import './App.css';
import { NavMain } from './components/NavMain';

export default function App() {
	return (
			<div className="App">
				<Home/>
				<NavMain/>
			</div>
	);
}
