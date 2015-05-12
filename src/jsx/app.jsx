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

var Puzzle = React.createClass(Radium.wrap({
	getInitialState: function() {
		return {
			cells: []
		}
	},
	componentDidMount: function() {
		EventEmitter.subscribe('validate', this.validatePuzzle);
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
	updateCell: function(cellIndex, value) {
		var cells = this.state.cells;
		var keys = _.keys(cells);
		cells[keys[cellIndex]] = value;
		this.setState({
			cells: cells
		})
	},
	validatePuzzle: function() {
		console.log('validating puzzle');
		console.log(this.state.cells);
		console.log(sudoku.getConflicts(this.state.cells));
	},
	resetPuzzle: function() {
		this.setState({
			cells: this.createCellMatrix()
		});
	},
	render: function() {
		var me = this;
		var cells = this.getCells2D();
		var cellIndex = -1;

		return (
			<table>
				<tbody>
					{_.map(cells, function(row) {
						return (
							<tr>
								{_.map(row, function(cell) {
									cellIndex++;
									return <td><Cell index={cellIndex} value={cell} updateHandler={me.updateCell} /></td>;
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
		var html = this.getDOMNode().value;
		this.setState({
			value: html
		});
		this.props.updateHandler(this.props.index, html);
	},
	render: function() {
		return (
			<input type="text" value={this.state.value} onChange={this.handleChange} style={[cellStyles]} />
		)
	}
}));


var cellStyles = {
	cursor: 'pointer',
	fontSize: 18,
	margin: 0,
	padding: '2px 5px',
	width: 10,
	outline: 0,
	":hover": {
		background: '#eee',
		border: 'none'
	}
}

var ValidateButton = React.createClass(Radium.wrap({
	handleValidation: function() {
		EventEmitter.dispatch('validate');
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
		EventEmitter.dispatch('reset');
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
	<div>
		<Puzzle />
		<ValidateButton />
		<ResetButton />
	</div>,
	document.getElementById('board')
);