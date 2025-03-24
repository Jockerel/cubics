// Importar la clase Player
import Player from './player/Player.js';
import CharacterSystem from './player/CharacterSystem.js';
// Importar los enemigos
import { createEnemy } from './enemies/index.js';

class Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
        
        this.state = 'menu'; // menu, character-select, playing, gameover, paused
        this.player = null;
        this.enemies = [];
        this.wave = 1;
        this.score = 0;
        this.showStats = false;
        this.showInstructions = false;
        this.devMode = false; // Variable para el modo desarrollador
        
        this.totalEnemiesForWave = 0;
        this.enemiesSpawned = 0;
        this.spawnInterval = null;
        
        this.keys = {};
        this.countdown = 3;
        this.countdownTimer = null;
        this.setupEventListeners();
        this.gameLoop();
        window.game = this;
        this.damageNumbers = [];
        this.hearts = [];
        this.particles = [];
        this.characterSystem = new CharacterSystem();
        this.characterSelectionUI = null;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.keys.up = true;
                    this.keys.w = true;
                    if (this.devMode) {
                        this.wave = Math.min(25, this.wave + 1);
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.keys.down = true;
                    this.keys.s = true;
                    if (this.devMode) {
                        this.wave = Math.max(1, this.wave - 1);
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = true;
                    this.keys.a = true;
                    if (this.state === 'character-select') {
                        this.characterSystem.selectPreviousCharacter();
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = true;
                    this.keys.d = true;
                    if (this.state === 'character-select') {
                        this.characterSystem.selectNextCharacter();
                    }
                    break;
                case 'Enter':
                    if (this.state === 'character-select') {
                        this.startGame();
                    } else if (this.devMode) {
                        this.startGame();
                    }
                    break;
                case 'Escape':
                    if (this.state === 'character-select') {
                        this.state = 'menu';
                    } else if (this.state === 'playing') {
                        this.state = 'paused';
                    } else if (this.state === 'paused') {
                        this.state = 'playing';
                    } else if (this.devMode) {
                        this.devMode = false;
                    }
                    break;
                case ' ':
                    if (this.state === 'menu') {
                        this.state = 'character-select';
                    } else if (this.state === 'character-select') {
                        this.startGame();
                    } else if (this.state === 'gameover') {
                        this.state = 'menu';
                    }
                    break;
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.state === 'menu') {
            // Opciones del menú
            const buttonWidth = 200;
            const buttonHeight = 50;
            const buttonSpacing = 100;
            const buttonY = this.canvas.height/2;
            
            // Comprobar clic en el botón de iniciar juego
            if (this.isPointInButton(x, y, 
                this.canvas.width/2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight)) {
                // Cambiar a la pantalla de selección de personaje en lugar de iniciar directamente
                this.state = 'character-select';
                return;
            }
            
            // Comprobar clic en el botón de instrucciones
            if (this.isPointInButton(x, y, 
                this.canvas.width/2 - buttonWidth/2, buttonY + buttonSpacing, buttonWidth, buttonHeight)) {
                this.showInstructions = !this.showInstructions;
                this.devMode = false;
                return;
            }
            
            // Comprobar clic en el botón de modo desarrollador
            if (this.isPointInButton(x, y, 
                this.canvas.width/2 - buttonWidth/2, buttonY + buttonSpacing * 2, buttonWidth, buttonHeight)) {
                this.devMode = !this.devMode;
                this.showInstructions = false;
                return;
            }
        } else if (this.state === 'character-select') {
            // Manejar clic en la pantalla de selección de personaje
            if (this.characterSelectionUI) {
                const action = this.characterSystem.handleCharacterSelectionClick(
                    x, y, this.characterSelectionUI
                );
                
                if (action === 'select') {
                    // Iniciar el juego con el personaje seleccionado
                    this.startGame();
                }
                
                // Si es navegación, la UI se actualizará en el próximo frame
            }
        } else if (this.state === 'paused') {
            const panelWidth = 1000;
            const panelHeight = 700;
            const panelX = (this.canvas.width - panelWidth) / 2;
            const panelY = (this.canvas.height - panelHeight) / 2;

            // Botón de continuar
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, panelY + panelHeight - 80, 200, 50)) {
                this.state = 'playing';
                return;
            }
            // Botón de volver al menú principal
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, panelY + panelHeight - 150, 200, 50)) {
                if (confirm('¿Estás seguro de que deseas volver al menú principal? Se perderá el progreso de la partida actual.')) {
                    this.state = 'menu';
                }
                return;
            }
        } else if (this.state === 'waveComplete') {
            const panelWidth = 1000;
            const panelHeight = 700;
            const panelX = (this.canvas.width - panelWidth) / 2;
            const panelY = (this.canvas.height - panelHeight) / 2;

            // Botón para comenzar siguiente oleada
            const nextWaveButtonX = this.canvas.width/2 - 100;
            const nextWaveButtonY = panelY + panelHeight - 80;
            
            if (x >= nextWaveButtonX && x <= nextWaveButtonX + 200 && 
                y >= nextWaveButtonY && y <= nextWaveButtonY + 50) {
                console.log('Iniciando siguiente oleada...');
                this.startNextWave();
                return;
            }

            // Verificar clics en botones de mejora de estadísticas
            if (this.player.skillPoints > 0) {
                const stats = [
                    null, // Nivel (no mejorable)
                    null, // Experiencia (no mejorable)
                    'health',
                    'strength',
                    'armor',
                    'agility',
                    'attackSpeed',
                    'critChance',
                    'critDamage',
                    'healthRegen',
                    'lifeSteal',
                    'range',
                    'moveSpeed'
                ];
                
                stats.forEach((stat, index) => {
                    if (stat) { // Solo procesar estadísticas mejorables
                        const buttonX = panelX + 350;
                        const buttonY = panelY + 140 + (index * 40) - 20;
                        
                        if (x >= buttonX && x <= buttonX + 35 &&
                            y >= buttonY && y <= buttonY + 30) {
                            this.showStatPreview(stat);
                        }
                    }
                });
            }

            // Verificar clics en botones de evolución
            if (this.player.evolutionPoints > 0) {
                const bodyParts = ['head', 'torso', 'arms', 'hands', 'legs', 'feet'];
                const rightPanelX = panelX + panelWidth/2 + 40;
                
                bodyParts.forEach((part, index) => {
                    if (!this.player.evolvedParts[part]) {
                        const buttonX = rightPanelX + 300;
                        const buttonY = panelY + 140 + index * 80 - 25;
                        
                        if (x >= buttonX && x <= buttonX + 120 &&
                            y >= buttonY && y <= buttonY + 35) {
                            this.showEvolutionPreview(part);
                        }
                    }
                });
            }
        } else if (this.state === 'gameOver') {
            // Botón de reinicio
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, this.canvas.height/2 + 200, 200, 50)) {
                this.state = 'menu';
            }
        }
    }

    isPointInButton(x, y, buttonX, buttonY, buttonWidth, buttonHeight) {
        return x >= buttonX && x <= buttonX + buttonWidth &&
               y >= buttonY && y <= buttonY + buttonHeight;
    }

    drawButton(x, y, width, height, text, isHovered = false) {
        this.ctx.fillStyle = isHovered ? '#4CAF50' : '#45a049';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
    }

    drawMenu() {
        // Fondo negro
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Título con efecto de brillo
        this.ctx.save();
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CUBICS', this.canvas.width/2, this.canvas.height/4);
        this.ctx.restore();

        // Subtítulo con animación
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Un juego de supervivencia geométrica', this.canvas.width/2, this.canvas.height/4 + 60);

        // Botones con efectos hover
        const buttonSpacing = 100;
        const buttonY = this.canvas.height/2;
        
        // Botón de inicio
        this.drawButton(this.canvas.width/2 - 100, buttonY, 200, 50, 'Iniciar Juego', true);
        
        // Botón de instrucciones
        this.drawButton(this.canvas.width/2 - 100, buttonY + buttonSpacing, 200, 50, 'Instrucciones', true);

        // Botón de modo desarrollador (temporal)
        this.drawButton(this.canvas.width/2 - 100, buttonY + buttonSpacing * 2, 200, 50, 'Modo Desarrollador', true);

        // Instrucciones con diseño mejorado
        if (this.showInstructions) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const instructionsPanel = {
                x: this.canvas.width/4,
                y: this.canvas.height/4,
                width: this.canvas.width/2,
                height: this.canvas.height/2
            };
            
            // Panel de instrucciones
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(instructionsPanel.x, instructionsPanel.y, instructionsPanel.width, instructionsPanel.height);
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(instructionsPanel.x, instructionsPanel.y, instructionsPanel.width, instructionsPanel.height);
            
            // Título de instrucciones
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Cómo Jugar', instructionsPanel.x + instructionsPanel.width/2, instructionsPanel.y + 50);
            
            // Contenido de instrucciones
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            const instructions = [
                'Controles:',
                '• Flechas del teclado para moverte',
                '• El personaje ataca automáticamente al acercarse a los enemigos',
                '',
                'Objetivo:',
                '• Sobrevive el mayor tiempo posible',
                '• Elimina enemigos para subir de nivel',
                '• Mejora tus estadísticas para volverte más fuerte',
                '',
                'Tipos de enemigos:',
                '• Círculos grises: Enemigos básicos',
                '• Triángulos morados: Lanzan proyectiles',
                '',
                'Presiona "Instrucciones" para cerrar'
            ];
            
            instructions.forEach((line, index) => {
                this.ctx.fillStyle = index === 0 || line === 'Objetivo:' || line === 'Tipos de enemigos:' ? '#4CAF50' : '#ffffff';
                this.ctx.fillText(line, instructionsPanel.x + 50, instructionsPanel.y + 100 + index * 30);
            });
        }

        // Panel de modo desarrollador
        if (this.devMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const devPanel = {
                x: this.canvas.width/4,
                y: this.canvas.height/4,
                width: this.canvas.width/2,
                height: this.canvas.height/2
            };
            
            // Panel de modo desarrollador
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(devPanel.x, devPanel.y, devPanel.width, devPanel.height);
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(devPanel.x, devPanel.y, devPanel.width, devPanel.height);
            
            // Título
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Modo Desarrollador', devPanel.x + devPanel.width/2, devPanel.y + 50);
            
            // Instrucciones
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            const instructions = [
                'Selecciona la oleada inicial:',
                '• Usa las flechas arriba/abajo para cambiar la oleada',
                '• Presiona Enter para confirmar',
                '• Presiona ESC para cancelar',
                '',
                `Oleada seleccionada: ${this.wave}`,
                '',
                'Presiona ESC para cerrar'
            ];
            
            instructions.forEach((line, index) => {
                this.ctx.fillText(line, devPanel.x + 50, devPanel.y + 120 + (index * 30));
            });
        }
    }

    drawStatsPanel(readOnly = false) {
        const panelWidth = 1000;
        const panelHeight = 700;
        const x = (this.canvas.width - panelWidth) / 2;
        const y = (this.canvas.height - panelHeight) / 2;

        // Fondo del panel con gradiente
        const panelGradient = this.ctx.createLinearGradient(x, y, x, y + panelHeight);
        panelGradient.addColorStop(0, 'rgba(26, 26, 46, 0.95)');
        panelGradient.addColorStop(1, 'rgba(22, 33, 62, 0.95)');
        this.ctx.fillStyle = panelGradient;
        this.ctx.fillRect(x, y, panelWidth, panelHeight);

        // Borde del panel con brillo
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Efecto de brillo en los bordes
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        this.ctx.shadowBlur = 0;

        // Títulos con efecto de brillo
        this.ctx.save();
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Estadísticas', x + panelWidth/4, y + 60);
        this.ctx.fillText('Evolución', x + (panelWidth * 3/4), y + 60);
        this.ctx.restore();

        // Panel izquierdo: Estadísticas y puntos de habilidad
        this.ctx.textAlign = 'left';
        this.ctx.font = '22px Arial';
        
        // Puntos de habilidad disponibles con icono
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`Puntos de Habilidad: ${this.player.skillPoints}`, x + 40, y + 100);
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 40, y + 110);
        this.ctx.lineTo(x + panelWidth/2 - 40, y + 110);
        this.ctx.stroke();

        // Lista de estadísticas con botones de mejora
        const stats = [
            { label: 'Nivel', value: this.player.level, stat: null },
            { label: 'Experiencia', value: `${this.player.experience}/${this.player.experienceToNextLevel}`, stat: null },
            { label: 'Vida', value: `${Math.floor(this.player.stats.health)}/${this.player.stats.maxHealth}`, stat: 'health', 
              improvement: `+${8 * this.player.evolutionMultipliers.health}` },
            { label: 'Fuerza', value: this.player.stats.strength, stat: 'strength',
              improvement: `+${1.5 * this.player.evolutionMultipliers.strength}` },
            { label: 'Armadura', value: this.player.stats.armor, stat: 'armor',
              improvement: `+${1.5}` },
            { label: 'Agilidad', value: `${this.player.stats.agility}%`, stat: 'agility',
              improvement: `+${0.8 * this.player.evolutionMultipliers.agility}%` },
            { label: 'Velocidad de Ataque', value: this.player.stats.attackSpeed.toFixed(1), stat: 'attackSpeed',
              improvement: `+${0.15 * this.player.evolutionMultipliers.attackSpeed}` },
            { label: 'Probabilidad de Crítico', value: `${this.player.stats.critChance}%`, stat: 'critChance',
              improvement: `+${1.5 * this.player.evolutionMultipliers.critChance}%` },
            { label: 'Daño Crítico', value: `${this.player.stats.critDamage}%`, stat: 'critDamage',
              improvement: `+${8 * this.player.evolutionMultipliers.critDamage}%` },
            { label: 'Regeneración de Vida', value: `${this.player.stats.healthRegen}/s`, stat: 'healthRegen',
              improvement: `+${0.05 * this.player.evolutionMultipliers.healthRegen}/s` },
            { label: 'Robo de Vida', value: `${this.player.stats.lifeSteal}%`, stat: 'lifeSteal',
              improvement: `+${0.8 * this.player.evolutionMultipliers.lifeSteal}%` },
            { label: 'Alcance', value: this.player.stats.range, stat: 'range',
              improvement: `+${4 * this.player.evolutionMultipliers.range}` },
            { label: 'Velocidad de Movimiento', value: this.player.stats.moveSpeed.toFixed(1), stat: 'moveSpeed',
              improvement: `+${0.25 * this.player.evolutionMultipliers.moveSpeed}` }
        ];

        stats.forEach((stat, index) => {
            const yPos = y + 140 + index * 40;
            
            // Estadística
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`${stat.label}: ${stat.value}`, x + 40, yPos);
            
            // Botón de mejora si la estadística puede mejorarse
            if (stat.stat && this.player.skillPoints > 0) {
                const buttonX = x + 350;
                const buttonY = yPos - 20;
                
                // Fondo del botón con gradiente
                const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX + 35, buttonY + 30);
                buttonGradient.addColorStop(0, '#4CAF50');
                buttonGradient.addColorStop(1, '#45a049');
                this.ctx.fillStyle = buttonGradient;
                this.ctx.fillRect(buttonX, buttonY, 35, 30);
                
                // Borde del botón
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(buttonX, buttonY, 35, 30);
                
                // Símbolo de mejora
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('+', buttonX + 17, buttonY + 22);
                
                // Texto de mejora
                this.ctx.font = '18px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText(stat.improvement, buttonX + 45, buttonY + 22);
            }
        });

        // Panel derecho: Sistema de evolución
        const rightPanelX = x + panelWidth/2 + 40;
        
        // Puntos de evolución disponibles
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`Puntos de Evolución: ${this.player.evolutionPoints}`, rightPanelX, y + 100);
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(rightPanelX, y + 110);
        this.ctx.lineTo(x + panelWidth - 40, y + 110);
        this.ctx.stroke();
        
        // Partes del cuerpo y sus beneficios
        const bodyParts = [
            { name: 'Cabeza', benefits: '+50% mejoras de crítico', part: 'head', icon: '🧠' },
            { name: 'Torso', benefits: '+50% mejoras de vida y regeneración', part: 'torso', icon: '💪' },
            { name: 'Brazos', benefits: '+50% mejoras de fuerza y velocidad de ataque', part: 'arms', icon: '🦾' },
            { name: 'Manos', benefits: '+50% mejoras de robo de vida y crítico', part: 'hands', icon: '🤚' },
            { name: 'Piernas', benefits: '+50% mejoras de velocidad y agilidad', part: 'legs', icon: '🦵' },
            { name: 'Pies', benefits: '+50% mejoras de rango y velocidad', part: 'feet', icon: '🦶' }
        ];

        bodyParts.forEach((part, index) => {
            const yPos = y + 140 + index * 80;
            
            // Fondo de la tarjeta de evolución
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(rightPanelX - 10, yPos - 25, panelWidth/2 - 50, 70);
            
            // Icono
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? '#4CAF50' : '#ffffff';
            this.ctx.fillText(part.icon, rightPanelX, yPos);
            
            // Nombre de la parte
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? '#4CAF50' : '#ffffff';
            this.ctx.fillText(part.name, rightPanelX + 50, yPos);
            
            // Beneficios
            this.ctx.font = '18px Arial';
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillText(part.benefits, rightPanelX + 50, yPos + 30);
            
            // Botón de evolución si está disponible
            if (!this.player.evolvedParts[part.part] && this.player.evolutionPoints > 0) {
                const buttonX = rightPanelX + 300;
                const buttonY = yPos - 25;
                const buttonWidth = 120;
                const buttonHeight = 35;
                
                // Fondo del botón con gradiente
                const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
                buttonGradient.addColorStop(0, '#4CAF50');
                buttonGradient.addColorStop(1, '#45a049');
                this.ctx.fillStyle = buttonGradient;
                this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Borde del botón
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Texto del botón
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Evolucionar', buttonX + buttonWidth/2, buttonY + 22);
                this.ctx.textAlign = 'left';
            }
        });

        // Botones de control
        if (readOnly) {
            // Botón de continuar
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 80, 200, 50, 'Continuar');
            // Botón de volver al menú principal
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 150, 200, 50, 'Volver al Menú Principal');
        } else {
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 80, 200, 50, 'Siguiente Oleada');
        }
    }

    drawCharacterSelection() {
        // Delegar la renderización al sistema de personajes y guardar la referencia a la UI
        this.characterSelectionUI = this.characterSystem.drawCharacterSelection(this.ctx, this.canvas);
    }

    startGame() {
        this.state = 'playing';
        
        // Crear el personaje seleccionado en lugar del genérico
        this.player = this.characterSystem.createSelectedCharacter(
            this.canvas.width/2, 
            this.canvas.height/2
        );
        
        // Ajustar el nivel del jugador según la oleada seleccionada en modo desarrollador
        if (this.devMode) {
            // Calcular el nivel basado en la oleada (aproximadamente 0.5 niveles por oleada)
            const targetLevel = Math.floor(this.wave * 0.5) + 1;
            
            // Ajustar directamente el nivel y la experiencia
            this.player.level = targetLevel;
            this.player.experience = 0;
            this.player.experienceToNextLevel = 100;
            
            // Calcular y aplicar multiplicadores basados en el nivel
            const levelMultiplier = 1 + (targetLevel - 1) * 0.1; // 10% de aumento por nivel
            
            // Guardar las estadísticas originales
            const originalStats = { ...this.player.stats };
            
            // Aplicar multiplicadores a las estadísticas
            Object.keys(originalStats).forEach(stat => {
                if (typeof originalStats[stat] === 'number') {
                    this.player.stats[stat] = originalStats[stat] * levelMultiplier;
                    
                    // Redondear valores enteros
                    if (stat !== 'attackSpeed' && stat !== 'healthRegen' && 
                        stat !== 'lifeSteal' && stat !== 'critChance' && 
                        stat !== 'critDamage' && stat !== 'moveSpeed') {
                        this.player.stats[stat] = Math.floor(this.player.stats[stat]);
                    }
                }
            });
            
            // Actualizar valores calculados y asegurarse de que la salud esté al máximo
            this.player.attackRange = this.player.stats.range;
            this.player.maxAttackCooldown = 60 / this.player.stats.attackSpeed;
            this.player.stats.health = this.player.stats.maxHealth;
        }
        
        this.enemies = [];
        this.wave = this.devMode ? this.wave : 1;
        this.score = 0;
        this.hearts = [];
        this.particles = [];
        this.startNextWave();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'menu') {
            this.drawMenu();
        } else if (this.state === 'character-select') {
            this.drawCharacterSelection();
        } else if (this.state === 'playing') {
            // Dibujar jugador y enemigos
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => {
                enemy.draw(this.ctx);
                enemy.projectiles.forEach(proj => {
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            });

            // Dibujar partículas
            this.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });

            // Panel de información del jugador (arriba)
            const barWidth = 200;
            const barHeight = 20;
            const barSpacing = 25;
            const panelX = 30;
            const panelY = 30;

            // Fondo del panel
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(panelX - 15, panelY - 15, (barWidth + barSpacing) * 3 + 30, barHeight + 30);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.strokeRect(panelX - 15, panelY - 15, (barWidth + barSpacing) * 3 + 30, barHeight + 30);

            // Barra de vida
            const healthGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(1, '#ff6666');
            this.drawHorizontalBar(panelX, panelY, barWidth, barHeight, 
                this.player.stats.health / this.player.stats.maxHealth, 
                healthGradient, `Vida: ${Math.floor(this.player.stats.health)}/${this.player.stats.maxHealth}`);

            // Barra de experiencia
            const expGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            expGradient.addColorStop(0, '#4CAF50');
            expGradient.addColorStop(1, '#8BC34A');
            this.drawHorizontalBar(panelX + barWidth + barSpacing, panelY, barWidth, barHeight,
                this.player.experience / this.player.experienceToNextLevel,
                expGradient, `Nivel ${this.player.level} - Exp: ${this.player.experience}/${this.player.experienceToNextLevel}`);

            // Barra de evolución
            const evoGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            evoGradient.addColorStop(0, '#2196F3');
            evoGradient.addColorStop(1, '#03A9F4');
            const evolutionProgress = this.player.enemiesKilled / 
                this.player.evolutionThresholds[Math.min(this.player.evolutionLevel, this.player.evolutionThresholds.length - 1)];
            this.drawHorizontalBar(panelX + (barWidth + barSpacing) * 2, panelY, barWidth, barHeight,
                evolutionProgress, evoGradient, `Evolución ${this.player.evolutionLevel} - Enemigos: ${this.player.enemiesKilled}`);

            // Panel de información de oleada (arriba a la derecha)
            const waveInfoX = this.canvas.width - 250;
            const waveInfoY = 30;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(waveInfoX - 15, waveInfoY - 15, 235, 110);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.strokeRect(waveInfoX - 15, waveInfoY - 15, 235, 110);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Oleada: ${this.wave}`, waveInfoX, waveInfoY + 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Enemigos: ${this.enemies.length}`, waveInfoX, waveInfoY + 50);
            this.ctx.fillText(`Puntuación: ${this.score}`, waveInfoX, waveInfoY + 80);

            // Indicador de pausa
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Presiona ESC para pausar', this.canvas.width/2, 30);

            // Dibujar corazones y cofres
            this.hearts.forEach(heart => {
                this.ctx.save();
                
                // Aplicar transformaciones para la animación
                this.ctx.translate(heart.x, heart.y);
                this.ctx.rotate(heart.rotation);
                this.ctx.scale(heart.scale, heart.scale);
                
                if (heart.isChest) {
                    // Sombra
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowOffsetY = 4;

                    // Base del cofre
                    const gradient = this.ctx.createLinearGradient(
                        -heart.size/2, -heart.size/2,
                        heart.size/2, heart.size/2
                    );
                    gradient.addColorStop(0, '#8B4513');
                    gradient.addColorStop(1, '#654321');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(-heart.size/2, -heart.size/3, heart.size, heart.size/1.5);
                    
                    // Tapa del cofre
                    this.ctx.beginPath();
                    this.ctx.moveTo(-heart.size/2, -heart.size/3);
                    this.ctx.lineTo(heart.size/2, -heart.size/3);
                    this.ctx.lineTo(heart.size/2, -heart.size/1.2);
                    this.ctx.lineTo(-heart.size/2, -heart.size/1.2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Detalles dorados
                    this.ctx.fillStyle = '#FFD700';
                    // Bisagras
                    this.ctx.fillRect(-heart.size/2.2, -heart.size/3, heart.size/10, heart.size/5);
                    this.ctx.fillRect(heart.size/2.2 - heart.size/10, -heart.size/3, heart.size/10, heart.size/5);
                    
                    // Cerradura
                    this.ctx.beginPath();
                    this.ctx.arc(0, -heart.size/4, heart.size/6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Detalles metálicos en las esquinas
                    this.ctx.fillStyle = '#DAA520';
                    const cornerSize = heart.size/8;
                    this.ctx.fillRect(-heart.size/2, -heart.size/3, cornerSize, cornerSize);
                    this.ctx.fillRect(heart.size/2 - cornerSize, -heart.size/3, cornerSize, cornerSize);
                    this.ctx.fillRect(-heart.size/2, heart.size/6 - cornerSize, cornerSize, cornerSize);
                    this.ctx.fillRect(heart.size/2 - cornerSize, heart.size/6 - cornerSize, cornerSize, cornerSize);
                    
                    // Efecto de brillo
                    const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, heart.size);
                    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
                    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.fillRect(-heart.size, -heart.size, heart.size * 2, heart.size * 2);
                } else {
                    // Sombra del corazón
                    this.ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
                    this.ctx.shadowBlur = 10;
                    
                    // Dibujar corazón
                    this.ctx.fillStyle = '#ff69b4';
                    this.ctx.beginPath();
                    const topCurveHeight = heart.size * 0.3;
                    
                    // Dibujar la forma del corazón
                    this.ctx.moveTo(0, heart.size/4);
                    
                    // Curva izquierda
                    this.ctx.bezierCurveTo(
                        -heart.size/2, 0, 
                        -heart.size/2, -topCurveHeight,
                        0, -heart.size/2
                    );
                    
                    // Curva derecha
                    this.ctx.bezierCurveTo(
                        heart.size/2, -topCurveHeight,
                        heart.size/2, 0,
                        0, heart.size/4
                    );
                    
                    this.ctx.fill();
                    
                    // Brillo
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(-heart.size/4, -heart.size/4, heart.size/6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            });

            // Mostrar cuenta regresiva si está activa
            if (this.countdownTimer) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 72px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.countdown, this.canvas.width/2, this.canvas.height/2);
            }

            // Dibujar números de daño
            this.damageNumbers = this.damageNumbers.filter(number => {
                // Actualizar posición y opacidad
                number.offsetY -= 2;
                number.alpha -= 0.02;
                
                if (number.alpha <= 0) return false;

                this.ctx.save();
                this.ctx.globalAlpha = number.alpha;
                
                // Configurar estilo según el tipo
                if (number.type === 'miss') {
                    this.ctx.fillStyle = '#808080';
                    this.ctx.font = 'bold 24px Arial';
                    this.ctx.fillText('MISS', number.x, number.y + number.offsetY);
                } else {
                    // Configurar color según el tipo
                    this.ctx.fillStyle = number.color;
                    
                    // Efecto de sombra para mejor visibilidad
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.shadowBlur = 4;
                    
                    // Escalar el texto para críticos
                    this.ctx.font = `bold ${24 * number.scale}px Arial`;
                    this.ctx.textAlign = 'center';
                    
                    // Mostrar el número o texto
                    if (number.isText) {
                        this.ctx.fillText(number.damage, number.x, number.y + number.offsetY);
                    } else {
                        this.ctx.fillText(Math.round(number.damage), number.x, number.y + number.offsetY);
                    }
                }
                
                this.ctx.restore();
                return true;
            });
        } else if (this.state === 'paused') {
            // Dibujar el juego en pausa
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            
            // Dibujar panel de estadísticas (solo lectura)
            this.drawStatsPanel(true);
        } else if (this.state === 'waveComplete') {
            // Dibujar el juego
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            
            // Dibujar panel de estadísticas con botón de siguiente oleada
            this.drawStatsPanel(false);
        } else if (this.state === 'gameOver') {
            // Fondo semitransparente
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Texto de Game Over
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
            
            // Estadísticas finales
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Puntuación final: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
            this.ctx.fillText(`Nivel alcanzado: ${this.player.level}`, this.canvas.width/2, this.canvas.height/2 + 70);
            this.ctx.fillText(`Oleada: ${this.wave}`, this.canvas.width/2, this.canvas.height/2 + 100);
            
            // Mensaje especial si completó todas las oleadas
            if (this.wave > 25) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.font = 'bold 32px Arial';
                this.ctx.fillText('¡Felicidades! Has completado todas las oleadas', this.canvas.width/2, this.canvas.height/2 + 150);
            }
            
            // Botón de reinicio
            this.drawButton(this.canvas.width/2 - 100, this.canvas.height/2 + 200, 200, 50, 'Volver al Menú');
        }
    }

    drawHorizontalBar(x, y, width, height, fillPercentage, color, label) {
        // Sombra
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 5;
        
        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, width, height);
        
        // Barra de progreso
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width * Math.min(1, fillPercentage), height);
        
        // Resetear sombra
        this.ctx.shadowBlur = 0;
        
        // Borde
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Etiqueta con sombra de texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText(label, x + 10, y + height/2 + 5);
        this.ctx.shadowBlur = 0;
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnEnemies() {
        // Calcular número total de enemigos para la oleada
        this.totalEnemiesForWave = Math.min(5 + this.wave * 2, 50);
        this.enemiesSpawned = 0;
        
        // Si es la oleada 10, 20 o 25, generar el jefe correspondiente
        if (this.wave === 10 || this.wave === 20 || this.wave === 25) {
            // Generar el jefe en el centro superior de la pantalla
            this.enemies.push(createEnemy(
                this.canvas.width / 2,
                -50,
                this.wave === 10 ? 'star' : (this.wave === 20 ? 'diamond' : 'finalBoss')
            ));
            this.enemiesSpawned = this.totalEnemiesForWave;
            return;
        }
        
        // Iniciar el spawner de enemigos
        this.spawnInterval = setInterval(() => {
            // No generar enemigos si el juego está pausado
            if (this.state !== 'playing' || this.countdownTimer) {
                return;
            }

            if (this.enemiesSpawned < this.totalEnemiesForWave) {
                // Determinar cuántos enemigos generar en este grupo
                let enemiesInGroup;
                const remainingEnemies = this.totalEnemiesForWave - this.enemiesSpawned;
                const random = Math.random();
                
                // 4% de probabilidad de generar un cofre
                if (random < 0.04) {
                    enemiesInGroup = 1;
                    const side = Math.floor(Math.random() * 4);
                    let x, y;
                    
                    switch(side) {
                        case 0: // Arriba
                            x = Math.random() * this.canvas.width;
                            y = -50;
                            break;
                        case 1: // Derecha
                            x = this.canvas.width + 50;
                            y = Math.random() * this.canvas.height;
                            break;
                        case 2: // Abajo
                            x = Math.random() * this.canvas.width;
                            y = this.canvas.height + 50;
                            break;
                        case 3: // Izquierda
                            x = -50;
                            y = Math.random() * this.canvas.height;
                            break;
                    }
                    
                    this.enemies.push(createEnemy(x, y, 'chest'));
                    this.enemiesSpawned++;
                } else {
                    if (random < 0.05 && remainingEnemies >= 4) { // 5% de probabilidad de 4 enemigos
                        enemiesInGroup = 4;
                    } else if (random < 0.15 && remainingEnemies >= 3) { // 10% de probabilidad de 3 enemigos
                        enemiesInGroup = 3;
                    } else if (random < 0.35 && remainingEnemies >= 2) { // 20% de probabilidad de 2 enemigos
                        enemiesInGroup = 2;
                    } else {
                        enemiesInGroup = 1;
                    }

                    // Determinar punto de aparición para el grupo
                    const side = Math.floor(Math.random() * 4);
                    let baseX, baseY;
                    
                    switch(side) {
                        case 0: // Arriba
                            baseX = Math.random() * this.canvas.width;
                            baseY = -50;
                            break;
                        case 1: // Derecha
                            baseX = this.canvas.width + 50;
                            baseY = Math.random() * this.canvas.height;
                            break;
                        case 2: // Abajo
                            baseX = Math.random() * this.canvas.width;
                            baseY = this.canvas.height + 50;
                            break;
                        case 3: // Izquierda
                            baseX = -50;
                            baseY = Math.random() * this.canvas.height;
                            break;
                    }

                    // Generar grupo de enemigos
                    for (let i = 0; i < enemiesInGroup; i++) {
                        // Determinar tipo de enemigo basado en la oleada actual
                        let type;
                        const typeRandom = Math.random();
                        
                        if (this.wave >= 7) {
                            if (typeRandom < 0.5) { // 50% círculos
                                type = 'circle';
                            } else if (typeRandom < 0.7) { // 20% triángulos
                                type = 'triangle';
                            } else if (typeRandom < 0.85) { // 15% pentágonos
                                type = 'pentagon';
                            } else { // 15% octágonos
                                type = 'octagon';
                            }
                        } else if (this.wave >= 5) {
                            if (typeRandom < 0.6) { // 60% círculos
                                type = 'circle';
                            } else if (typeRandom < 0.85) { // 25% triángulos
                                type = 'triangle';
                            } else { // 15% pentágonos
                                type = 'pentagon';
                            }
                        } else {
                            // Antes de la oleada 5, solo círculos y triángulos
                            type = typeRandom < 0.7 ? 'circle' : 'triangle';
                        }
                        
                        // Añadir variación a la posición dentro del grupo
                        const spread = 60; // Distancia máxima entre enemigos del grupo
                        const offsetX = (Math.random() - 0.5) * spread;
                        const offsetY = (Math.random() - 0.5) * spread;
                        
                        this.enemies.push(createEnemy(
                            baseX + offsetX,
                            baseY + offsetY,
                            type
                        ));
                        this.enemiesSpawned++;
                    }
                }
            } else {
                // Detener el spawner cuando se hayan generado todos los enemigos
                clearInterval(this.spawnInterval);
            }
        }, Math.max(3000 - (this.wave * 100), 1000));
    }

    startNextWave() {
        // Limpiar temporizadores existentes
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        
        // Limpiar enemigos y corazones
        this.enemies = [];
        this.hearts = [];
        
        // Cambiar estado a playing
        this.state = 'playing';
        this.countdown = 3;
        
        // Iniciar cuenta regresiva
        this.countdownTimer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
                // Iniciar generación gradual de enemigos
                this.spawnEnemies();
            }
        }, 1000);
    }

    update() {
        if (this.state !== 'playing' || this.countdownTimer) return;

        // Actualizar jugador
        this.player.update();

        // Movimiento del jugador
        if (this.keys['ArrowLeft'] || this.keys['a']) this.player.move(-1, 0);
        if (this.keys['ArrowRight'] || this.keys['d']) this.player.move(1, 0);
        if (this.keys['ArrowUp'] || this.keys['w']) this.player.move(0, -1);
        if (this.keys['ArrowDown'] || this.keys['s']) this.player.move(0, 1);

        // Ataque automático
        this.player.attack(this.enemies);

        // Comprobar colisión con enemigos
        this.enemies.forEach(enemy => {
            // Actualizar enemigo
            enemy.update(this.player);

            // Comprobar colisión con proyectiles del jugador
            this.player.projectiles.forEach((proj, projIndex) => {
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemy.size + proj.size) {
                    // Eliminar proyectil
                    this.player.projectiles.splice(projIndex, 1);

                    // Aplicar daño al enemigo
                    enemy.health -= proj.damage;

                    // Mostrar número de daño
                    this.addDamageNumber(enemy.x, enemy.y, proj.damage, proj.isCritical ? 'critical' : 'normal');

                    // Aplicar robo de vida si corresponde
                    if (this.player.stats.lifeSteal > 0) {
                        const healAmount = proj.damage * (this.player.stats.lifeSteal / 100);
                        this.player.stats.health = Math.min(this.player.stats.maxHealth, this.player.stats.health + healAmount);
                        // Mostrar número de curación
                        this.addDamageNumber(this.player.x, this.player.y - this.player.size, Math.round(healAmount), 'heal');
                    }
                }
            });

            // Comprobar colisión con proyectiles del enemigo
            enemy.projectiles.forEach((proj, projIndex) => {
                const dx = proj.x - this.player.x;
                const dy = proj.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.player.size + proj.size) {
                    // Eliminar proyectil
                    enemy.projectiles.splice(projIndex, 1);

                    // Aplicar daño al jugador
                    const damageResult = this.player.takeDamage(enemy.damage);
                    if (damageResult.type === 'miss') {
                        this.addDamageNumber(this.player.x, this.player.y - this.player.size, 0, 'miss');
                    } else {
                        this.addDamageNumber(this.player.x, this.player.y - this.player.size, damageResult.damage, 'received');
                    }
                }
            });

            // Comprobar colisión directa jugador-enemigo
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.size + enemy.size) {
                // Si es un cofre, recogerlo
                if (enemy.type === 'chest') {
                    // Eliminar el cofre
                    this.enemies = this.enemies.filter(e => e !== enemy);
                    
                    // Otorgar un punto de habilidad
                    this.player.skillPoints++;
                    this.addDamageNumber(enemy.x, enemy.y - 30, '+1 Punto de Habilidad', 'skill');
                    
                    // Efecto visual
                    this.createChestCollectEffect(enemy.x, enemy.y);
                    
                    return;
                }
                
                // Si el jugador o el enemigo están en enfriamiento de colisión, no aplicar daño
                if (this.player.collisionCooldown > 0 || enemy.collisionCooldown > 0) {
                    return;
                }
                
                // Aplicar daño al jugador por colisión con enemigo (50% del daño normal)
                const collisionDamage = enemy.damage * 0.5;
                const damageResult = this.player.takeDamage(collisionDamage);
                if (damageResult.type === 'miss') {
                    this.addDamageNumber(this.player.x, this.player.y - this.player.size, 0, 'miss');
                } else {
                    this.addDamageNumber(this.player.x, this.player.y - this.player.size, damageResult.damage, 'received');
                }
                
                // Aplicar enfriamiento de colisión
                this.player.collisionCooldown = this.player.maxCollisionCooldown;
                enemy.collisionCooldown = enemy.maxCollisionCooldown;
            }
        });

        // Verificar colisiones y muerte de enemigos
        this.enemies = this.enemies.filter(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (this.player.size + enemy.size) / 2) {
                // Verificar enfriamiento de colisión
                if (this.player.collisionCooldown === 0) {
                    // El enemigo causa daño al jugador por colisión
                    const damageResult = this.player.takeDamage(enemy.damage);
                    if (damageResult.type === 'miss') {
                        this.addDamageNumber(this.player.x, this.player.y - this.player.size, 0, 'miss');
                    } else {
                        this.addDamageNumber(this.player.x, this.player.y - this.player.size, damageResult.damage, 'received');
                    }
                    this.player.collisionCooldown = this.player.maxCollisionCooldown;
                }
                
                if (enemy.collisionCooldown === 0) {
                    // El jugador causa daño al enemigo por colisión
                    enemy.health -= this.player.stats.strength;
                    // Mostrar el daño causado al enemigo
                    this.addDamageNumber(enemy.x, enemy.y - enemy.size, this.player.stats.strength, 'normal');
                    enemy.collisionCooldown = enemy.maxCollisionCooldown;
                }
            }
            
            if (enemy.health <= 0) {
                // Efecto especial para la muerte del jefe
                if (enemy.type === 'star' || enemy.type === 'diamond' || enemy.type === 'finalBoss') {
                    // Crear explosión de partículas
                    this.createBossDeathEffect(enemy.x, enemy.y);
                    // Otorgar 5 puntos de habilidad
                    this.player.skillPoints += 5;
                    // Mostrar mensaje especial
                    if (enemy.type === 'finalBoss') {
                        this.addDamageNumber(enemy.x, enemy.y - 100, "Has salvado nuestro mundo....", 'boss');
                        setTimeout(() => {
                            this.addDamageNumber(enemy.x, enemy.y - 60, "Gracias....", 'boss');
                        }, 1500);
                    }
                    this.addDamageNumber(enemy.x, enemy.y - 30, '+5 Puntos de Habilidad', 'boss');
                    // Aumentar más la puntuación por derrotar al jefe
                    this.score += enemy.type === 'finalBoss' ? 2000 : 1000;
                } else if (enemy.type === 'chest') {
                    // Crear un cofre del tesoro al morir
                    this.hearts.push({
                        x: enemy.x,
                        y: enemy.y,
                        size: 20,
                        isChest: true,
                        rotation: 0,
                        scale: 1,
                        alpha: 1
                    });
                }
                
                // 15% de probabilidad de soltar un corazón
                if (Math.random() < 0.15) {
                    this.hearts.push({
                        x: enemy.x,
                        y: enemy.y,
                        size: 15
                    });
                }
                
                this.player.enemiesKilled++;
                this.player.gainExperience(20);
                this.player.updateEvolution();
                this.score += 100;
                return false;
            }
            
            return true;
        });

        // Verificar si el jugador ha muerto
        if (this.player.stats.health <= 0) {
            this.state = 'gameOver';
        }

        // Verificar fin de oleada (modificado para tener en cuenta el spawn gradual)
        if (this.enemies.length === 0 && this.enemiesSpawned >= this.totalEnemiesForWave) {
            if (this.spawnInterval) {
                clearInterval(this.spawnInterval);
                this.spawnInterval = null;
            }
            this.wave++;
            if (this.wave > 25) {
                this.state = 'gameOver';
                return;
            }
            this.state = 'waveComplete';
            return;
        }

        // Actualizar partículas
        this.particles = this.particles.filter(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.alpha -= particle.fadeSpeed;
            particle.size += particle.growthRate;
            return particle.alpha > 0;
        });

        // Actualizar corazones y cofres
        this.hearts = this.hearts.filter(heart => {
            if (heart.isChest) {
                // Animación del cofre
                heart.rotation = Math.sin(Date.now() / 500) * 0.1;
                heart.scale = 1 + Math.sin(Date.now() / 300) * 0.1;
                
                // Si el jugador está cerca, recoger el cofre
                const dx = this.player.x - heart.x;
                const dy = this.player.y - heart.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.player.size) {
                    this.player.skillPoints++; // Dar un punto de habilidad
                    // Mostrar mensaje de +1 punto de habilidad
                    this.addDamageNumber(heart.x, heart.y - 30, '+1 Punto de Habilidad', 'skill');
                    // Crear efecto de partículas doradas
                    this.createChestCollectEffect(heart.x, heart.y);
                    return false;
                }
                return true;
            } else {
                // Si el jugador está cerca y no tiene vida completa, mover el corazón hacia él
                if (this.player.stats.health < this.player.stats.maxHealth) {
                    const dx = this.player.x - heart.x;
                    const dy = this.player.y - heart.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Si el corazón está dentro del rango de atracción, moverlo hacia el jugador
                    if (distance < this.player.pickupRange) {
                        // Calcular dirección hacia el jugador
                        const angle = Math.atan2(dy, dx);
                        const speed = 5; // Velocidad de atracción
                        heart.x += Math.cos(angle) * speed;
                        heart.y += Math.sin(angle) * speed;
                        
                        // Si el corazón está muy cerca del jugador, curarlo
                        if (distance < this.player.size) {
                            this.player.stats.health = Math.min(
                                this.player.stats.maxHealth,
                                this.player.stats.health + 10
                            );
                            return false;
                        }
                    }
                }
                return true;
            }
        });
    }

    showStatPreview(stat) {
        const oldValue = this.getStatValue(stat);
        const newValue = this.calculateNewStatValue(stat);
        
        // Crear ventana de confirmación
        const confirmWindow = document.createElement('div');
        confirmWindow.style.position = 'fixed';
        confirmWindow.style.top = '50%';
        confirmWindow.style.left = '50%';
        confirmWindow.style.transform = 'translate(-50%, -50%)';
        confirmWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        confirmWindow.style.padding = '20px';
        confirmWindow.style.border = '2px solid #4CAF50';
        confirmWindow.style.borderRadius = '10px';
        confirmWindow.style.color = 'white';
        confirmWindow.style.zIndex = '1000';
        
        confirmWindow.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Confirmar Mejora</h3>
            <p>Valor actual: ${oldValue}</p>
            <p>Nuevo valor: ${newValue}</p>
            <button id="confirmStat" style="margin: 10px; padding: 5px 15px;">Confirmar</button>
            <button id="cancelStat" style="margin: 10px; padding: 5px 15px;">Cancelar</button>
        `;
        
        document.body.appendChild(confirmWindow);
        this.confirmWindow = confirmWindow;
        
        // Añadir event listeners para los botones
        document.getElementById('confirmStat').addEventListener('click', () => {
            this.confirmStatImprovement(stat);
        });
        
        document.getElementById('cancelStat').addEventListener('click', () => {
            this.cancelStatImprovement();
        });
    }

    showEvolutionPreview(part) {
        const confirmWindow = document.createElement('div');
        confirmWindow.style.position = 'fixed';
        confirmWindow.style.top = '50%';
        confirmWindow.style.left = '50%';
        confirmWindow.style.transform = 'translate(-50%, -50%)';
        confirmWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        confirmWindow.style.padding = '20px';
        confirmWindow.style.border = '2px solid #4CAF50';
        confirmWindow.style.borderRadius = '10px';
        confirmWindow.style.color = 'white';
        confirmWindow.style.zIndex = '1000';
        
        confirmWindow.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Confirmar Evolución</h3>
            <p>¿Deseas evolucionar esta parte?</p>
            <button id="confirmEvo" style="margin: 10px; padding: 5px 15px;">Confirmar</button>
            <button id="cancelEvo" style="margin: 10px; padding: 5px 15px;">Cancelar</button>
        `;
        
        document.body.appendChild(confirmWindow);
        this.confirmWindow = confirmWindow;
        
        // Añadir event listeners para los botones
        document.getElementById('confirmEvo').addEventListener('click', () => {
            this.confirmEvolution(part);
        });
        
        document.getElementById('cancelEvo').addEventListener('click', () => {
            this.cancelEvolution();
        });
    }

    getStatValue(stat) {
        return this.player.stats[stat];
    }

    calculateNewStatValue(stat) {
        const currentValue = this.getStatValue(stat);
        switch(stat) {
            case 'health':
                return currentValue + (8 * this.player.evolutionMultipliers.health);
            case 'strength':
                return currentValue + (1.5 * this.player.evolutionMultipliers.strength);
            case 'armor':
                return currentValue + 1.5;
            case 'agility':
                return currentValue + (0.8 * this.player.evolutionMultipliers.agility);
            case 'attackSpeed':
                return currentValue + (0.15 * this.player.evolutionMultipliers.attackSpeed);
            case 'critChance':
                return currentValue + (1.5 * this.player.evolutionMultipliers.critChance);
            case 'critDamage':
                return currentValue + (8 * this.player.evolutionMultipliers.critDamage);
            case 'healthRegen':
                return currentValue + (0.05 * this.player.evolutionMultipliers.healthRegen); // Reducido de 0.08 a 0.05
            case 'lifeSteal':
                return currentValue + (0.8 * this.player.evolutionMultipliers.lifeSteal);
            case 'range':
                return currentValue + (4 * this.player.evolutionMultipliers.range);
            case 'moveSpeed':
                return currentValue + (0.25 * this.player.evolutionMultipliers.moveSpeed);
            default:
                return currentValue;
        }
    }

    confirmStatImprovement(stat) {
        this.player.useSkillPoint(stat);
        this.removeConfirmWindow();
    }

    confirmEvolution(part) {
        this.player.evolve(part);
        this.removeConfirmWindow();
    }

    cancelStatImprovement() {
        this.removeConfirmWindow();
    }

    cancelEvolution() {
        this.removeConfirmWindow();
    }

    removeConfirmWindow() {
        const confirmWindow = document.querySelector('div[style*="z-index: 1000"]');
        if (confirmWindow) {
            confirmWindow.remove();
        }
    }

    addDamageNumber(x, y, damage, type = 'normal') {
        // type puede ser: 'normal' (blanco), 'received' (rojo), 'crit' (amarillo), 'miss' (gris), 'boss' (dorado), 'skill' (verde brillante)
        const scale = type === 'crit' ? 1.5 : (type === 'boss' ? 2.5 : (type === 'skill' ? 2 : 1));
        const color = type === 'boss' ? '#FFD700' : (
            type === 'normal' ? '#ffffff' :
            type === 'received' ? '#ff0000' :
            type === 'crit' ? '#ffd700' :
            type === 'skill' ? '#4CAF50' : '#808080'
        );
        
        this.damageNumbers.push({
            x: x,
            y: y,
            damage: damage,
            type: type,
            alpha: 1,
            offsetY: 0,
            scale: scale,
            color: color,
            isText: typeof damage === 'string'
        });
    }

    createBossDeathEffect(x, y) {
        // Crear explosión grande
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 2 + Math.random() * 3;
            const distance = 50 + Math.random() * 100;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 10 + Math.random() * 5,
                color: '#FFD700',
                alpha: 1,
                fadeSpeed: 0.02,
                growthRate: 0.1
            });
        }

        // Crear destellos
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 15,
                color: '#FFFFFF',
                alpha: 1,
                fadeSpeed: 0.01,
                growthRate: 0.2
            });
        }

        // Crear ondas expansivas
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: 0,
                dy: 0,
                size: 20,
                color: '#FFA500',
                alpha: 0.5,
                fadeSpeed: 0.01,
                growthRate: 2
            });
        }
    }

    createChestCollectEffect(x, y) {
        // Crear efecto de partículas doradas
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 3,
                color: '#FFD700',
                alpha: 1,
                fadeSpeed: 0.02,
                growthRate: 0.1
            });
        }
    }
}

// Iniciar el juego
window.onload = () => {
    new Game();
}; 