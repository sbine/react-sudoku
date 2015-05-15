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
			board: sudoku.generate(),
			cells: {},
			errored: []
		}
	},
	componentDidMount: function() {
		EventEmitter.subscribe('validate', this.validatePuzzle);
		EventEmitter.subscribe('reset', this.resetPuzzle);
		this.createCellMatrix();
	},
	createCellMatrix: function() {
		var generated = this.state.board;
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

		this.setState({
			cells: board
		});

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
			cells: cells,
			errored: []
		})
	},
	validatePuzzle: function() {
		var conflicts = sudoku.getConflicts(this.state.cells);
		var erroredFields = [];

		if (!conflicts.length > 0) {
			return true;
		}

		// Loop over all conflicts and add each conflicted cell to our error object
		_.each(conflicts, function(value, key) {
			_.each(value.errorFields, function(v, k) {
				erroredFields.push(v);
			});
		});

		var erroredQuadrant = conflicts[0].unit;

		this.setState({
			errored: erroredFields
		});
	},
	resetPuzzle: function() {
		this.replaceState(this.getInitialState(), function() {
			this.createCellMatrix();
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
									var readonly = false;
									if (me.state.errored.indexOf(cellsIndexed[cellIndex]) !== -1) {
										errored = true;
									}
									if (me.state.board[cellsIndexed[cellIndex]] !== undefined) {
										readonly = 'readonly';
										cell = me.state.board[cellsIndexed[cellIndex]];
									}
									return <Cell
												index={cellIndex}
												value={cell}
												readonly={readonly}
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
						className="sudoku-cell"
						readOnly={this.props.readonly} />
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