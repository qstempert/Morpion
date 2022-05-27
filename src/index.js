import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


function Square(props) {
    return (
        <button
            className={props.classStyle}
            onClick={props.onClick}>
                {props.value}
            </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]} 
                classStyle={this.props.winner && this.props.winner.includes(i) ? "winning-square" : "square"}
                onClick={() => this.props.onClick(i)}/>
        );
    }

    populateCellPerLines(j) {
        const lines = [];

        for (let i = 0 ; i < 3 ; i++) {
            lines.push(this.renderSquare(i + j));
        }
        return lines;
    }

    render() {
        const elements = []

        for (let j = 0 ; j < 3 ; j++) {
            elements.push(<div key={j} className="board-row">{this.populateCellPerLines(j * 3)}</div>);
        }

        return (
            <div>
                {elements}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            historyPlayed: [{
                player : '',
                location : null
            }],
            orderedChrono: true
        };
    }

    resetGame() {
        this.setState({
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            historyPlayed: [{
                player : '',
                location : null
            }],
            orderedChrono: true
        });
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const historyPlayed = this.state.historyPlayed.slice(0, this.state.stepNumber + 1);
        
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            historyPlayed: historyPlayed.concat([{location : i, player: squares[i]}])
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        })
    }
    
    determineColumn(i) {
        if ([0, 3, 6].includes(i)) {
            return 1;
        } else if ([1, 4, 7].includes(i)) {
            return 2;
        } else if ([2, 5, 8].includes(i)) {
            return 3;
        }
        return '';
    }
    
    determineLine(i) {
        if ([0, 1, 2].includes(i)) {
            return 1;
        } else if ([3, 4, 5].includes(i)) {
            return 2;
        } else if ([6, 7, 8].includes(i)) {
            return 3;
        }
        return '';
    }

    determineLocationPlayed(i) {
        const col = this.determineColumn(i);
        const line = this.determineLine(i);
    
        if (!col || ! line) {
            return null;
        }
        return '(' + col + ', ' + line + ')';
    }

    orderMoves(orderedChrono) {
        this.setState({
            orderedChrono: !orderedChrono
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            const desc = move ? 'Revenir au tour n°' + move : null;
            const player = move ? this.state.historyPlayed[move].player : null;

            return (desc ?
                <li key={move}>
                    {move ? ' ' + player + ' a joué en ' + this.determineLocationPlayed(this.state.historyPlayed[move].location) : null}
                    <div>
                        <button onClick={() => this.jumpTo(move)}>
                            {desc}
                        </button>
                    </div>
                </li> : null
            );
        });

        let status;

        if (winner) {
            status = current.squares[winner[0]] + ' a gagné !';
        } else if (history.length === 10) {
            status = 'Match nul';
        } else {
            status = 'Prochain joueur : ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <button style={{'marginBottom': '5px'}} onClick={() => this.resetGame()}>Réinitialiser la partie</button>
                    <Board 
                        squares={current.squares}
                        winner={winner}
                        onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.orderMoves(this.state.orderedChrono)}>Ordonner</button>
                    <ol>{this.state.orderedChrono ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [a, b, c];
        }
    }
    return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);