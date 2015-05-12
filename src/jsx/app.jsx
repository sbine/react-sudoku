var Board = React.createClass(Radium.wrap({
	getInitialState: function() {
		return {
			cells: []
		}
	},
	componentDidMount: function() {
		this.setState({ cells: this.createCellMatrix() });
	},
	createCellMatrix: function() {
		var generated = sudoku.generate();
		var board = [];

		for (i = 65; i <= 73; i++) {
			var quadrant = String.fromCharCode(i);

			for (j = 1; j <= 9; j++) {
				var cell = quadrant + '' + j;

				if (generated[cell] !== undefined) {
					board[cell] = generated[cell];
				}
				else {
					board[cell] = '';
				}
			}
		}

		return board;
	},
	getCells2D: function() {
		var cells = _.values(this.state.cells);
		var cells2D = [];
		var i, j, chunk = 9;

		for (i = 0, j = cells.length; i < j; i += chunk) {
			cells2D.push(cells.slice(i, i + chunk));
		}

		return cells2D;
	},
	render: function() {
		var cells = this.getCells2D();
		return (
			<table>
				<tbody>
					{cells.map(function(row) {
						return (
							<tr>
								{row.map(function(cell) {
									return <Cell value={cell} />;
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		)
	}
}));

var Cell = React.createClass(Radium.wrap({
	getInitialState: function() {
		return {
			value: this.props.value || ''
		};
	},
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	render: function() {
		return (
			<td contentEditable="true" style={[cellStyles]}>
				{this.state.value}
			</td>
		)
	}
}));

var boardStyles = {
	border: '1px solid black',
	borderRadius: 4,
	margin: "20px auto",
	outline: 0,
	padding: 3,
	cellPadding: 0,
	cellSpacing: 0
}

var cellStyles = {
	border: '1px solid gray',
	cursor: 'pointer',
	fontSize: 18,
	fontWeight: 'bold',
	margin: 0,
	padding: '3px 6px',
	width: 10,
	":hover": {
		background: '#eee'
	}
}

React.render(<Board/>, document.getElementById('board'));