import CircleEnemy from './tipos/CircleEnemy.js';
import TriangleEnemy from './tipos/TriangleEnemy.js';
import SquareEnemy from './tipos/SquareEnemy.js';
import PentagonEnemy from './tipos/PentagonEnemy.js';
import StarEnemy from './tipos/StarEnemy.js';
import OctagonEnemy from './tipos/OctagonEnemy.js';
import ChestEnemy from './tipos/ChestEnemy.js';
import DiamondEnemy from './tipos/DiamondEnemy.js';
import FinalBossEnemy from './tipos/FinalBossEnemy.js';

// Exportar la clase Enemy base
export { default as Enemy } from './Enemy.js';

// Exportar todas las clases de enemigos
export {
    CircleEnemy,
    TriangleEnemy,
    SquareEnemy,
    PentagonEnemy,
    StarEnemy,
    OctagonEnemy,
    ChestEnemy,
    DiamondEnemy,
    FinalBossEnemy
};

// Función de fábrica para crear enemigos basados en el tipo
export function createEnemy(x, y, type) {
    switch (type) {
        case 'circle':
            return new CircleEnemy(x, y);
        case 'triangle':
            return new TriangleEnemy(x, y);
        case 'square':
            return new SquareEnemy(x, y);
        case 'pentagon':
            return new PentagonEnemy(x, y);
        case 'star':
            return new StarEnemy(x, y);
        case 'octagon':
            return new OctagonEnemy(x, y);
        case 'chest':
            return new ChestEnemy(x, y);
        case 'diamond':
            return new DiamondEnemy(x, y);
        case 'finalBoss':
            return new FinalBossEnemy(x, y);
        default:
            return new CircleEnemy(x, y);
    }
} 