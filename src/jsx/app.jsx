var EventEmitter = {
    eventRepository: {},
	dispatch: function (event, data) {
		if (!this.eventRepository[event]) {
			return;
		}
		for (var i = 0; i < this.eventRepository[event].length; i++) {
			this.eventRepository[event][i](data);
		}
	},
	subscribe: function (event, callback) {
		if (!this.eventRepository[event]) {
			this.eventRepository[event] = [];
		}
		this.eventRepository[event].push(callback);
	}
}

var Board = React.createClass({
	handleValidation: function() {
		console.log('validating');
	},
	handleReset: function() {
		EventEmitter.dispatch('reset');
	},
	render: function() {
		return (
			<div>
				<Puzzle />

				<ResetButton handleReset={this.handleReset} />
			</div>
		)
	}
});

var Puzzle = React.createClass(Radium.wrap({
	getInitialState: function() {
		return {
			cells: []
		}
	},
	componentDidMount: function() {
		EventEmitter.subscribe('reset', this.resetPuzzle);
		this.resetPuzzle();
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
	resetPuzzle: function() {
		console.log('resetting puzzle');
		this.setState({
			cells: this.createCellMatrix()
		});
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
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			value: nextProps.value
		});
	},
	handleChange: function(event) {
		this.setState({
			value: event.target.value
		});
	},
	render: function() {
		return (
			<td contentEditable="true" style={[cellStyles]}>
				{this.state.value}
			</td>
		)
	}
}));



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

var ValidateButton = React.createClass(Radium.wrap({
	handleValidation: function() {
		this.props.handleValidation();
	},
	render: function() {
		return (
			<button style={[buttonStyles]} onClick={this.handleValidation}>
				Validate
			</button>
		)
	}
}));

var ResetButton = React.createClass(Radium.wrap({
	handleReset: function() {
		this.props.handleReset();
	},
	render: function() {
		return (
			<button style={[buttonStyles]} onClick={this.handleReset}>
				Reset
			</button>
		)
	}
}));

var buttonStyles = {
	margin: "10px 5px",
	display: 'inline',
	outline: 0
}


React.render(
	<Board />,
	document.getElementById('board')
);