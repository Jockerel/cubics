import Player from './Player.js';
import Tanque from './tipos/Tanque.js';
import Asesino from './tipos/Asesino.js';
import Mago from './tipos/Mago.js';
import Vampiro from './tipos/Vampiro.js';
import Velocista from './tipos/Velocista.js';
import Viejo from './tipos/Viejo.js';
import Fantasma from './tipos/Fantasma.js';
import Francotirador from './tipos/Francotirador.js';

export default class CharacterSystem {
    constructor() {
        this.characters = [
            {
                id: 'equilibrado',
                name: 'Equilibrado',
                description: 'Un personaje con estadísticas balanceadas, perfecto para principiantes.',
                previewColor: '#FFB6C1',
                stats: {
                    fuerza: 7,
                    velocidad: 7,
                    defensa: 7
                },
                create: (x, y) => new Player(x, y)
            },
            {
                id: 'tanque',
                name: 'Tanque',
                description: 'Alta vida y defensa, pero movimiento lento y menos daño.',
                previewColor: '#4682B4',
                stats: {
                    fuerza: 5,
                    velocidad: 4,
                    defensa: 10
                },
                create: (x, y) => new Tanque(x, y)
            },
            {
                id: 'asesino',
                name: 'Asesino',
                description: 'Alta velocidad y daño crítico, pero poca vida y defensa.',
                previewColor: '#8A2BE2',
                stats: {
                    fuerza: 9,
                    velocidad: 10,
                    defensa: 3
                },
                create: (x, y) => new Asesino(x, y)
            },
            {
                id: 'mago',
                name: 'Mago',
                description: 'Gran alcance y daño por proyectil, pero baja defensa y vida.',
                previewColor: '#FF7F50',
                stats: {
                    fuerza: 5,
                    velocidad: 6,
                    defensa: 4
                },
                create: (x, y) => new Mago(x, y)
            },
            {
                id: 'vampiro',
                name: 'Vampiro',
                description: 'Especialista en robo de vida, pero sin armadura ni regeneración natural.',
                previewColor: '#8B0000',
                stats: {
                    fuerza: 6,
                    velocidad: 7,
                    defensa: 2
                },
                create: (x, y) => new Vampiro(x, y)
            },
            {
                id: 'velocista',
                name: 'Velocista',
                description: 'Alta velocidad y movilidad. La velocidad aumenta su fuerza de ataque.',
                previewColor: '#00FFFF',
                stats: {
                    fuerza: 6,
                    velocidad: 10,
                    defensa: 5
                },
                create: (x, y) => new Velocista(x, y)
            },
            {
                id: 'viejo',
                name: 'Viejo',
                description: 'Sabio anciano con gran resistencia, pero lenta movilidad y limitaciones físicas.',
                previewColor: '#808080',
                stats: {
                    fuerza: 8,
                    velocidad: 3,
                    defensa: 9
                },
                create: (x, y) => new Viejo(x, y)
            },
            {
                id: 'fantasma',
                name: 'Fantasma',
                description: 'Etéreo y ágil, difícil de golpear pero muy vulnerable al daño.',
                previewColor: '#E6E6FA',
                stats: {
                    fuerza: 5,
                    velocidad: 9,
                    defensa: 0
                },
                create: (x, y) => new Fantasma(x, y)
            },
            {
                id: 'francotirador',
                name: 'Francotirador',
                description: 'Especialista en ataques a larga distancia con gran precisión.',
                previewColor: '#2F4F4F',
                stats: {
                    fuerza: 7,
                    velocidad: 5,
                    defensa: 6
                },
                create: (x, y) => new Francotirador(x, y)
            }
        ];
        
        this.selectedCharacterIndex = 0;
        this.animationTime = 0;
        this.animationDirection = 1;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.previousCharacterIndex = 0;
        this.particles = [];
        
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.001 + 0.0005,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    getSelectedCharacter() {
        return this.characters[this.selectedCharacterIndex];
    }
    
    createSelectedCharacter(x, y) {
        return this.getSelectedCharacter().create(x, y);
    }
    
    selectNextCharacter() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.previousCharacterIndex = this.selectedCharacterIndex;
        this.selectedCharacterIndex = (this.selectedCharacterIndex + 1) % this.characters.length;
        this.transitionProgress = 0;
    }
    
    selectPreviousCharacter() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.previousCharacterIndex = this.selectedCharacterIndex;
        this.selectedCharacterIndex = (this.selectedCharacterIndex - 1 + this.characters.length) % this.characters.length;
        this.transitionProgress = 0;
    }
    
    selectCharacterById(id) {
        const index = this.characters.findIndex(char => char.id === id);
        if (index !== -1) {
            this.selectedCharacterIndex = index;
            return true;
        }
        return false;
    }
    
    updateAnimation() {
        // Actualizar tiempo de animación
        this.animationTime += 0.05 * this.animationDirection;
        if (this.animationTime > 1) {
            this.animationTime = 1;
            this.animationDirection = -1;
        } else if (this.animationTime < 0) {
            this.animationTime = 0;
            this.animationDirection = 1;
        }
        
        // Actualizar transición entre personajes
        if (this.isTransitioning) {
            this.transitionProgress += 0.05;
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.isTransitioning = false;
            }
        }
        
        // Actualizar partículas
        this.particles.forEach(particle => {
            particle.y -= particle.speed;
            if (particle.y < 0) {
                particle.y = 1;
                particle.x = Math.random();
            }
        });
    }
    
    drawCharacterSelection(ctx, canvas) {
        this.updateAnimation();
        
        // Fondo oscuro con gradiente
        const gradientBg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientBg.addColorStop(0, '#0f0c29');
        gradientBg.addColorStop(0.5, '#302b63');
        gradientBg.addColorStop(1, '#24243e');
        ctx.fillStyle = gradientBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar partículas
        ctx.save();
        this.particles.forEach(particle => {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x * canvas.width, particle.y * canvas.height, 
                    particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        
        // Título con efecto de resplandor pulsante
        ctx.save();
        const glowIntensity = 5 + Math.sin(Date.now() / 500) * 5;
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15 + glowIntensity;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SELECCIÓN DE PERSONAJE', canvas.width/2, canvas.height/6);
        
        // Subtítulo
        ctx.shadowBlur = 5;
        ctx.font = 'italic 20px Arial';
        ctx.fillText('Elige tu héroe para la batalla', canvas.width/2, canvas.height/6 + 40);
        ctx.restore();
        
        // Panel de personajes con borde brillante
        const panelWidth = canvas.width * 0.85;
        const panelHeight = canvas.height * 0.55;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = canvas.height/4 + 20;
        
        // Fondo del panel con efecto de vidrio
        ctx.save();
        const gradientPanel = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        gradientPanel.addColorStop(0, 'rgba(30, 30, 80, 0.7)');
        gradientPanel.addColorStop(1, 'rgba(20, 20, 50, 0.8)');
        ctx.fillStyle = gradientPanel;
        
        // Efecto de borde redondeado
        const radius = 15;
        ctx.beginPath();
        ctx.moveTo(panelX + radius, panelY);
        ctx.lineTo(panelX + panelWidth - radius, panelY);
        ctx.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + radius);
        ctx.lineTo(panelX + panelWidth, panelY + panelHeight - radius);
        ctx.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - radius, panelY + panelHeight);
        ctx.lineTo(panelX + radius, panelY + panelHeight);
        ctx.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - radius);
        ctx.lineTo(panelX, panelY + radius);
        ctx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
        ctx.closePath();
        ctx.fill();
        
        // Borde brillante con animación
        ctx.strokeStyle = this.getSelectedCharacter().previewColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.getSelectedCharacter().previewColor;
        ctx.shadowBlur = 10 + 5 * Math.sin(Date.now() / 300);
        ctx.stroke();
        
        // Personaje actual y transición
        const currentChar = this.getSelectedCharacter();
        const prevChar = this.characters[this.previousCharacterIndex];
        
        // Vista previa del personaje (animada)
        const previewSize = 130;
        const previewX = panelX + panelWidth * 0.25;
        const previewY = panelY + panelHeight / 2 + Math.sin(Date.now() / 500) * 5;
        
        ctx.save();
        // Dibujar el personaje anterior si estamos en transición
        if (this.isTransitioning) {
            ctx.globalAlpha = 1 - this.transitionProgress;
            this.drawCharacterPreview(ctx, prevChar, previewX, previewY, previewSize, false);
        }
        
        // Dibujar el personaje actual
        ctx.globalAlpha = this.isTransitioning ? this.transitionProgress : 1;
        this.drawCharacterPreview(ctx, currentChar, previewX, previewY, previewSize, true);
        ctx.restore();
        
        // Nombre y descripción con animación de entrada
        ctx.save();
        const textX = panelX + panelWidth * 0.4;
        const nameY = panelY + panelHeight * 0.25;
        const descY = panelY + panelHeight * 0.35;
        
        // Fondo para el texto
        const textBgWidth = panelWidth * 0.55;
        const textBgHeight = panelHeight * 0.25;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(textX - 10, nameY - 40, textBgWidth, textBgHeight, 10);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = currentChar.previewColor;
        ctx.shadowBlur = 10;
        
        // Nombre del personaje
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(currentChar.name.toUpperCase(), textX, nameY);
        
        // Descripción
        ctx.shadowBlur = 0;
        ctx.font = '18px Arial';
        ctx.fillText(currentChar.description, textX, descY);
        ctx.restore();
        
        // Estadísticas del personaje
        this.drawCharacterStats(ctx, currentChar, textX, descY + 40, textBgWidth);
        
        // Flechas de navegación con animación
        this.drawNavigationArrow(ctx, panelX + 50, panelY + panelHeight/2, 'left');
        this.drawNavigationArrow(ctx, panelX + panelWidth - 50, panelY + panelHeight/2, 'right');
        
        // Panel inferior con vista previa de todos los personajes
        const miniPreviewSize = 50;
        const miniPreviewY = panelY + panelHeight - miniPreviewSize - 20;
        const totalWidth = this.characters.length * (miniPreviewSize + 10);
        const startX = panelX + (panelWidth - totalWidth) / 2;
        
        // Fondo del panel de selección rápida
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(panelX + 20, miniPreviewY - 10, panelWidth - 40, miniPreviewSize + 20);
        
        // Dibujar miniaturas de todos los personajes
        const miniatures = [];
        this.characters.forEach((char, index) => {
            const miniX = startX + index * (miniPreviewSize + 10);
            
            // Guardar referencia para interacción
            miniatures.push({
                id: char.id,
                x: miniX,
                y: miniPreviewY,
                size: miniPreviewSize,
                character: char
            });
            
            ctx.save();
            // Destacar el personaje seleccionado
            const isSelected = index === this.selectedCharacterIndex;
            const scale = isSelected ? 1.2 : 1;
            
            ctx.translate(miniX + miniPreviewSize/2, miniPreviewY + miniPreviewSize/2);
            ctx.scale(scale, scale);
            ctx.translate(-(miniX + miniPreviewSize/2), -(miniPreviewY + miniPreviewSize/2));
            
            // Dibujar fondo y borde
            ctx.fillStyle = char.previewColor;
            ctx.beginPath();
            ctx.arc(miniX + miniPreviewSize/2, miniPreviewY + miniPreviewSize/2, 
                    miniPreviewSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            if (isSelected) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(miniX + miniPreviewSize/2, miniPreviewY + miniPreviewSize/2, 
                        miniPreviewSize/2 + 2, 0, Math.PI * 2);
                ctx.stroke();
                
                // Texto indicador
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(char.name, miniX + miniPreviewSize/2, miniPreviewY + miniPreviewSize + 15);
            }
            
            ctx.restore();
            
            // Dibujar inicial del personaje
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char.name.charAt(0), miniX + miniPreviewSize/2, miniPreviewY + miniPreviewSize/2);
        });
        
        // Botón de selección con efecto hover
        const buttonWidth = 240;
        const buttonHeight = 60;
        const buttonX = canvas.width/2 - buttonWidth/2;
        const buttonY = panelY + panelHeight + 30;
        
        // Dibujar botón con gradiente
        const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        buttonGradient.addColorStop(0, '#4CAF50');
        buttonGradient.addColorStop(1, '#45a049');
        
        ctx.fillStyle = buttonGradient;
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        ctx.fill();
        
        // Borde del botón
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = currentChar.previewColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // Texto del botón
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SELECCIONAR PERSONAJE', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
        
        // Devolver elementos de UI para interacción
        return {
            leftArrow: {
                x: panelX + 50,
                y: panelY + panelHeight/2,
                radius: 30
            },
            rightArrow: {
                x: panelX + panelWidth - 50,
                y: panelY + panelHeight/2,
                radius: 30
            },
            selectButton: {
                x: buttonX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight
            },
            miniatures: miniatures
        };
    }
    
    drawCharacterPreview(ctx, character, x, y, size, isActive) {
        ctx.save();
        
        // Aplicar animación de flotación y escala
        const floatOffset = isActive ? Math.sin(Date.now() / 500) * 5 : 0;
        const scaleMultiplier = isActive ? (1 + 0.05 * Math.sin(Date.now() / 800)) : 1;
        
        ctx.translate(x, y + floatOffset);
        ctx.scale(scaleMultiplier, scaleMultiplier);
        
        // Efectos de partículas solo para el personaje activo
        if (isActive) {
            // Aura exterior
            const gradientAura = ctx.createRadialGradient(0, 0, size * 0.6, 0, 0, size * 1.2);
            gradientAura.addColorStop(0, character.previewColor.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            gradientAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradientAura;
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de brillo pulsante
            ctx.shadowColor = character.previewColor;
            ctx.shadowBlur = 15 + 5 * Math.sin(Date.now() / 300);
        }
        
        // Dibujar el personaje según su tipo
        switch(character.id) {
            case 'equilibrado':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos
                const eyeSize = size * 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/6, eyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/6, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size/4 + eyeSize/2, -size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/4 + eyeSize/2, -size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Sonrisa
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, size/6, size/4, 0, Math.PI);
                ctx.stroke();
                break;
                
            case 'tanque':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde del cubo
                ctx.strokeStyle = '#2c5d8f';
                ctx.lineWidth = 3;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos más pequeños
                const tankEyeSize = size * 0.12;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/6, tankEyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/6, tankEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size/4 + tankEyeSize/2, -size/6 - tankEyeSize/2, tankEyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/4 + tankEyeSize/2, -size/6 - tankEyeSize/2, tankEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Boca seria
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size/4, size/6);
                ctx.lineTo(size/4, size/6);
                ctx.stroke();
                
                // Armadura en el pecho
                ctx.fillStyle = '#2c5d8f';
                ctx.beginPath();
                ctx.moveTo(-size/4, -size/6 + 5);
                ctx.lineTo(size/4, -size/6 + 5);
                ctx.lineTo(size/6, size/4);
                ctx.lineTo(-size/6, size/4);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'asesino':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#4B0082';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos afilados
                ctx.fillStyle = '#000';
                ctx.beginPath();
                // Ojo izquierdo
                ctx.ellipse(-size/4, -size/6, size * 0.08, size * 0.12, Math.PI/4, 0, Math.PI * 2);
                // Ojo derecho
                ctx.ellipse(size/4, -size/6, size * 0.08, size * 0.12, -Math.PI/4, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(-size/4 + size * 0.04, -size/6 - size * 0.06, size * 0.03, 0, Math.PI * 2);
                ctx.arc(size/4 + size * 0.04, -size/6 - size * 0.06, size * 0.03, 0, Math.PI * 2);
                ctx.fill();
                
                // Máscara
                ctx.fillStyle = '#4B0082';
                ctx.beginPath();
                ctx.ellipse(0, -size/6, size/2, size/8, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Recorte para los ojos en la máscara
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.ellipse(-size/4, -size/6, size * 0.1, size * 0.14, Math.PI/4, 0, Math.PI * 2);
                ctx.ellipse(size/4, -size/6, size * 0.1, size * 0.14, -Math.PI/4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
                break;
                
            case 'mago':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#A52A2A';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Sombrero de mago
                ctx.fillStyle = '#A52A2A';
                ctx.beginPath();
                ctx.moveTo(-size/2 - 10, -size/4);
                ctx.lineTo(size/2 + 10, -size/4);
                ctx.lineTo(0, -size/2 - 30);
                ctx.closePath();
                ctx.fill();
                
                // Banda del sombrero
                ctx.fillStyle = '#DAA520';
                ctx.beginPath();
                ctx.rect(-size/2 - 5, -size/4, size + 10, 5);
                ctx.fill();
                
                // Ojos brillantes
                const magoEyeSize = size * 0.13;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/8, magoEyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/8, magoEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos (brillos mágicos)
                ctx.fillStyle = '#00FFFF';
                ctx.beginPath();
                ctx.arc(-size/4 + magoEyeSize/2, -size/8 - magoEyeSize/2, magoEyeSize/2, 0, Math.PI * 2);
                ctx.arc(size/4 + magoEyeSize/2, -size/8 - magoEyeSize/2, magoEyeSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Barba
                ctx.fillStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.moveTo(-size/6, size/8);
                ctx.lineTo(size/6, size/8);
                ctx.lineTo(0, size/2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'vampiro':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#500000';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos rojos brillantes
                const vampEyeSize = size * 0.15;
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/6, vampEyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/6, vampEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#FF8080';
                ctx.beginPath();
                ctx.arc(-size/4 + vampEyeSize/2, -size/6 - vampEyeSize/2, vampEyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/4 + vampEyeSize/2, -size/6 - vampEyeSize/2, vampEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Sonrisa malévola con colmillos
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, size/8, size/4, 0, Math.PI);
                ctx.stroke();
                
                // Colmillos
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.moveTo(-size/6, size/8);
                ctx.lineTo(-size/6 - size/12, size/4);
                ctx.lineTo(-size/6 + size/12, size/8);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(size/6, size/8);
                ctx.lineTo(size/6 + size/12, size/4);
                ctx.lineTo(size/6 - size/12, size/8);
                ctx.fill();
                
                // Capa vampírica
                ctx.fillStyle = '#500000';
                ctx.beginPath();
                ctx.moveTo(-size/2 - 10, -size/3);
                ctx.lineTo(-size/2, -size/2);
                ctx.lineTo(size/2, -size/2);
                ctx.lineTo(size/2 + 10, -size/3);
                ctx.lineTo(size/2 + 15, size/2);
                ctx.lineTo(-size/2 - 15, size/2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'velocista':
                // Efecto de velocidad/movimiento (estela)
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2 - 5, -size/2, size, size);
                ctx.fillRect(-size/2 - 10, -size/2, size, size);
                ctx.globalAlpha = 1;
                
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#008B8B';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos
                const velEyeSize = size * 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/6, velEyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/6, velEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size/4 + velEyeSize/2, -size/6 - velEyeSize/2, velEyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/4 + velEyeSize/2, -size/6 - velEyeSize/2, velEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Sonrisa confiada
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, size/6, size/5, 0, Math.PI);
                ctx.stroke();
                
                // Diseño de rayo en el pecho
                ctx.fillStyle = '#008B8B';
                ctx.beginPath();
                ctx.moveTo(0, -size/6);
                ctx.lineTo(size/4, 0);
                ctx.lineTo(0, size/4);
                ctx.lineTo(size/8, size/4);
                ctx.lineTo(-size/4, size/2);
                ctx.lineTo(-size/8, size/8);
                ctx.lineTo(-size/4, size/8);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'viejo':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#505050';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos con gafas
                const viejoEyeSize = size * 0.12;
                
                // Marco de gafas
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(-size/4, -size/6, viejoEyeSize * 1.5, viejoEyeSize * 1.2, 0, 0, Math.PI * 2);
                ctx.ellipse(size/4, -size/6, viejoEyeSize * 1.5, viejoEyeSize * 1.2, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                // Puente de las gafas
                ctx.beginPath();
                ctx.moveTo(-size/4 + viejoEyeSize, -size/6);
                ctx.lineTo(size/4 - viejoEyeSize, -size/6);
                ctx.stroke();
                
                // Ojos detrás de las gafas
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/4, -size/6, viejoEyeSize, 0, Math.PI * 2);
                ctx.arc(size/4, -size/6, viejoEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size/4 + viejoEyeSize/2, -size/6 - viejoEyeSize/2, viejoEyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/4 + viejoEyeSize/2, -size/6 - viejoEyeSize/2, viejoEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Barba
                ctx.fillStyle = '#DCDCDC';
                ctx.beginPath();
                ctx.ellipse(0, size/4, size/3, size/4, 0, 0, Math.PI);
                ctx.fill();
                
                // Cejas pobladas
                ctx.strokeStyle = '#DCDCDC';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-size/4 - viejoEyeSize, -size/6 - viejoEyeSize);
                ctx.lineTo(-size/4 + viejoEyeSize, -size/6 - viejoEyeSize * 0.8);
                ctx.moveTo(size/4 - viejoEyeSize, -size/6 - viejoEyeSize * 0.8);
                ctx.lineTo(size/4 + viejoEyeSize, -size/6 - viejoEyeSize);
                ctx.stroke();
                
                // Bastón
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-size/2 - 10, -size/2);
                ctx.lineTo(-size/2 - 5, size/2 + 15);
                ctx.stroke();
                break;
                
            case 'fantasma':
                ctx.globalAlpha = 0.8;
                
                // Efecto de brillo alrededor
                const ghostGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                ghostGradient.addColorStop(0, 'rgba(230, 230, 250, 0.1)');
                ghostGradient.addColorStop(0.6, 'rgba(230, 230, 250, 0.05)');
                ghostGradient.addColorStop(1, 'rgba(230, 230, 250, 0)');
                
                ctx.fillStyle = ghostGradient;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Cuerpo fantasmal (forma más redondeada que un cubo)
                ctx.fillStyle = character.previewColor;
                ctx.beginPath();
                ctx.arc(0, 0, size/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Cola fantasmal que se estrecha
                ctx.beginPath();
                ctx.moveTo(-size/3, 0);
                ctx.quadraticCurveTo(0, size, size/3, 0);
                ctx.closePath();
                ctx.fill();
                
                // Ojos brillantes
                const ghostEyeSize = size * 0.1;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size/5, -size/8, ghostEyeSize, 0, Math.PI * 2);
                ctx.arc(size/5, -size/8, ghostEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size/5 + ghostEyeSize/2, -size/8 - ghostEyeSize/2, ghostEyeSize/3, 0, Math.PI * 2);
                ctx.arc(size/5 + ghostEyeSize/2, -size/8 - ghostEyeSize/2, ghostEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Boca fantasmal (línea suave)
                ctx.strokeStyle = '#B0C4DE';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, size/8, size/5, 0.2, Math.PI - 0.2);
                ctx.stroke();
                break;
                
            case 'francotirador':
                // Cuerpo del cubo
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                // Borde
                ctx.strokeStyle = '#1A3333';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Ojos (uno cerrado como apuntando)
                const sniperEyeSize = size * 0.15;
                ctx.fillStyle = '#000';
                
                // Ojo izquierdo (cerrado/apuntando)
                ctx.beginPath();
                ctx.moveTo(-size/4 - sniperEyeSize, -size/6);
                ctx.lineTo(-size/4 + sniperEyeSize, -size/6);
                ctx.stroke();
                
                // Ojo derecho (abierto)
                ctx.beginPath();
                ctx.arc(size/4, -size/6, sniperEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillo en el ojo abierto
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(size/4 + sniperEyeSize/2, -size/6 - sniperEyeSize/2, sniperEyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Boca seria/concentrada
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-size/5, size/6);
                ctx.lineTo(size/5, size/6);
                ctx.stroke();
                
                // Rifle/mira en la mano
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                
                // Rifle
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(size * 0.7, -size * 0.2);
                ctx.stroke();
                
                // Mira telescópica (círculo en el extremo del rifle)
                ctx.beginPath();
                ctx.arc(size * 0.7, -size * 0.2, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0000';
                ctx.fill();
                
                // Soporte del rifle
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, size/3);
                ctx.stroke();
                break;
                
            default:
                // Cubo genérico para cualquier otro personaje
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(-size/2, -size/2, size, size);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size/2, -size/2, size, size);
        }
        
        ctx.restore();
    }
    
    drawCharacterStats(ctx, character, x, y, width) {
        const stats = character.stats;
        const statNames = ['Fuerza', 'Velocidad', 'Defensa'];
        const statValues = [stats.fuerza, stats.velocidad, stats.defensa];
        const maxStat = 10;
        const barHeight = 12;
        const spacing = 30;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x - 10, y - 10, width, spacing * 4, 10);
        ctx.fill();
        
        for (let i = 0; i < statNames.length; i++) {
            const barY = y + i * spacing;
            
            // Nombre de la estadística
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(statNames[i], x, barY);
            
            // Barra de fondo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x + 100, barY - barHeight/2, width - 120, barHeight, barHeight/2);
            ctx.fill();
            
            // Barra de progreso con gradiente
            const gradient = ctx.createLinearGradient(x + 100, 0, x + 100 + width - 120, 0);
            gradient.addColorStop(0, character.previewColor);
            gradient.addColorStop(1, this.lightenColor(character.previewColor, 50));
            ctx.fillStyle = gradient;
            
            // Calcular el ancho de la barra llena
            const fillWidth = ((width - 120) * statValues[i]) / maxStat;
            
            // Animar la barra de progreso
            const animProgress = this.isTransitioning ? this.transitionProgress : 1;
            const currentWidth = fillWidth * animProgress;
            
            ctx.beginPath();
            ctx.roundRect(x + 100, barY - barHeight/2, currentWidth, barHeight, barHeight/2);
            ctx.fill();
            
            // Valor numérico
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(statValues[i].toString(), x + 90, barY);
        }
        ctx.restore();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R : 255) * 0x10000 + 
                      (G < 255 ? G : 255) * 0x100 + 
                      (B < 255 ? B : 255)).toString(16).slice(1);
    }
    
    drawNavigationArrow(ctx, x, y, direction) {
        ctx.save();
        
        // Animar el tamaño del botón
        const pulseSize = 1 + 0.1 * Math.sin(Date.now() / 300);
        const arrowRadius = 30 * pulseSize;
        
        // Gradiente para el botón
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, arrowRadius);
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.9)');
        gradient.addColorStop(1, 'rgba(46, 125, 50, 0.9)');
        
        // Círculo base con efecto de brillo
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, arrowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, arrowRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Dibujar flecha
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Flecha con forma mejorada
        if (direction === 'left') {
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 12);
            ctx.lineTo(x - 8, y);
            ctx.lineTo(x + 8, y + 12);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 12);
            ctx.lineTo(x + 8, y);
            ctx.lineTo(x - 8, y + 12);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    isPointInCircle(x, y, circleX, circleY, radius) {
        const dx = x - circleX;
        const dy = y - circleY;
        return dx * dx + dy * dy <= radius * radius;
    }
    
    handleCharacterSelectionClick(x, y, uiElements) {
        // Comprobar si se hizo clic en la flecha izquierda
        if (this.isPointInCircle(x, y, uiElements.leftArrow.x, uiElements.leftArrow.y, uiElements.leftArrow.radius)) {
            this.selectPreviousCharacter();
            return 'navigate';
        }
        
        // Comprobar si se hizo clic en la flecha derecha
        if (this.isPointInCircle(x, y, uiElements.rightArrow.x, uiElements.rightArrow.y, uiElements.rightArrow.radius)) {
            this.selectNextCharacter();
            return 'navigate';
        }
        
        // Comprobar si se hizo clic en el botón de selección
        if (x >= uiElements.selectButton.x && 
            x <= uiElements.selectButton.x + uiElements.selectButton.width &&
            y >= uiElements.selectButton.y && 
            y <= uiElements.selectButton.y + uiElements.selectButton.height) {
            return 'select';
        }
        
        // Comprobar si se hizo clic en alguna miniatura de personaje
        if (uiElements.miniatures) {
            for (const mini of uiElements.miniatures) {
                const radius = mini.size / 2;
                if (this.isPointInCircle(x, y, mini.x + radius, mini.y + radius, radius)) {
                    // Buscar el índice del personaje seleccionado
                    const index = this.characters.findIndex(char => char.id === mini.id);
                    if (index !== -1 && index !== this.selectedCharacterIndex) {
                        this.isTransitioning = true;
                        this.previousCharacterIndex = this.selectedCharacterIndex;
                        this.selectedCharacterIndex = index;
                        this.transitionProgress = 0;
                        return 'navigate';
                    }
                    break;
                }
            }
        }
        
        return 'none';
    }
} 