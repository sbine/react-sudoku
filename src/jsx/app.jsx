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

var Puzzle = React.createClass({
	getInitialState: function() {
		return {
			cells: {},
			errored: []
		}
	},
	componentDidMount: function() {
		EventEmitter.subscribe('validate', this.validatePuzzle);
		EventEmitter.subscribe('reset', this.resetPuzzle);
		this.resetPuzzle();
	},
	createCellMatrix: function() {
		var generated = sudoku.generate();
		var board = {};

		for (i = 65; i <= 73; i++) {
			var quadrant = String.fromCharCode(i);

			for (j = 1; j <= 9; j++) {
				var cell = quadrant + '' + j;

				if (generated[cell] !== undefined) {
					board[cell] = {};
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
		var conflicts = sudoku.getConflicts(this.state.cells);

		if (!conflicts.length > 0) {
			console.log('puzzle is valid');
			return true;
		}

		var erroredFields = conflicts[0].errorFields;
		var erroredQuadrant = conflicts[0].unit;

		this.setState({
			errored: erroredFields
		});

		console.log('puzzle is invalid');
		console.log(erroredFields);
		console.log(erroredQuadrant);
	},
	resetPuzzle: function() {
		this.setState({
			cells: this.createCellMatrix(),
			errored: []
		});
	},
	render: function() {
		var me = this;
		var cells = this.getCells2D();
		var cellsIndexed = _.keys(this.state.cells);
		var cellIndex = -1;

		return (
			<table>
				<tbody>
					{_.map(cells, function(row) {
						return (
							<tr>
								{_.map(row, function(cell) {
									cellIndex++;
									var errored = false;
									if (me.state.errored.indexOf(cellsIndexed[cellIndex]) !== -1) {
										errored = true;
									}
									return <Cell
												index={cellIndex}
												value={cell}
												errored={errored}
												updateHandler={me.updateCell}/>;
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		)
	}
});

var Cell = React.createClass({
	handleChange: function(event) {
		var html = this.getDOMNode().firstChild.value;
		this.props.updateHandler(this.props.index, html);
	},
	render: function() {
		return (
			<td>
				<input type="text"
						value={this.props.value}
						onChange={this.handleChange}
						data-errored={this.props.errored}
						className="sudoku-cell" />
			</td>
		)
	}
});

var ValidateButton = React.createClass({
	handleValidation: function() {
		EventEmitter.dispatch('validate');
	},
	render: function() {
		return (
			<button className="sudoku-control" onClick={this.handleValidation}>
				Validate
			</button>
		)
	}
});

var ResetButton = React.createClass({
	handleReset: function() {
		EventEmitter.dispatch('reset');
	},
	render: function() {
		return (
			<button className="sudoku-control" onClick={this.handleReset}>
				New Puzzle
			</button>
		)
	}
});


React.render(
	<div>
		<Puzzle />
		<ValidateButton />
		<ResetButton />
	</div>,
	document.getElementById('board')
);