import Player from './Player.js';
import Tanque from './tipos/Tanque.js';
import Asesino from './tipos/Asesino.js';
import Mago from './tipos/Mago.js';

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
        ctx.restore();
        
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
        
        // Botón de selección con efecto hover
        const buttonWidth = 240;
        const buttonHeight = 60;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = panelY + panelHeight + 40;
        
        // Fondo del botón con gradiente
        const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        buttonGradient.addColorStop(0, '#4CAF50');
        buttonGradient.addColorStop(1, '#2E7D32');
        ctx.fillStyle = buttonGradient;
        
        // Dibujar botón con bordes redondeados
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        ctx.fill();
        
        // Borde del botón con brillo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // Texto del botón con sombra
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillText('SELECCIONAR', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
        
        // Indicador de navegación
        ctx.shadowBlur = 0;
        ctx.font = '18px Arial';
        ctx.fillText('< Anterior | Siguiente >', canvas.width/2, buttonY + buttonHeight + 30);
        ctx.fillText('O usa las teclas de dirección', canvas.width/2, buttonY + buttonHeight + 55);
        
        return {
            leftArrow: { x: panelX + 50, y: panelY + panelHeight/2, radius: 30 },
            rightArrow: { x: panelX + panelWidth - 50, y: panelY + panelHeight/2, radius: 30 },
            selectButton: { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight }
        };
    }
    
    drawCharacterPreview(ctx, character, x, y, size, isActive) {
        ctx.save();
        
        // Efecto de brillante alrededor del personaje
        if (isActive) {
            const glowSize = 20 + 5 * Math.sin(Date.now() / 300);
            ctx.shadowColor = character.previewColor;
            ctx.shadowBlur = glowSize;
        }
        
        // Dibujar cubo base
        ctx.fillStyle = character.previewColor;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        // Personalizar la apariencia según el tipo
        switch(character.id) {
            case 'equilibrado':
                // Ojos
                const eyeSize = size * 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(x - size/4, y - size/6, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + size/4, y - size/6, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos en los ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x - size/4 + eyeSize/2, y - size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
                ctx.arc(x + size/4 + eyeSize/2, y - size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Sonrisa
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y + size/6, size/4, 0, Math.PI);
                ctx.stroke();
                break;
                
            case 'tanque':
                // Ojos más pequeños
                const tankEyeSize = size * 0.12;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(x - size/4, y - size/6, tankEyeSize, 0, Math.PI * 2);
                ctx.arc(x + size/4, y - size/6, tankEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Boca seria
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - size/4, y + size/6);
                ctx.lineTo(x + size/4, y + size/6);
                ctx.stroke();
                
                // Armadura en el pecho
                ctx.fillStyle = '#2c5d8f';
                ctx.beginPath();
                ctx.moveTo(x - size/4, y - size/6 + 5);
                ctx.lineTo(x + size/4, y - size/6 + 5);
                ctx.lineTo(x + size/6, y + size/4);
                ctx.lineTo(x - size/6, y + size/4);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'asesino':
                // Forma más delgada
                ctx.clearRect(x - size/2, y - size/2, size, size);
                ctx.fillStyle = character.previewColor;
                ctx.fillRect(x - size/2.5, y - size/2, size/1.25, size);
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(x - size/2.5, y - size/2, size/1.25, size);
                
                // Ojos afilados
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(x - size/5, y - size/6);
                ctx.lineTo(x - size/12, y - size/8);
                ctx.lineTo(x - size/12, y - size/4);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x + size/5, y - size/6);
                ctx.lineTo(x + size/12, y - size/8);
                ctx.lineTo(x + size/12, y - size/4);
                ctx.closePath();
                ctx.fill();
                
                // Sonrisa malévola
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y + size/8, size/5, 0, Math.PI);
                ctx.stroke();
                
                // Colmillos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(x - size/8, y + size/8);
                ctx.lineTo(x - size/10, y + size/5);
                ctx.lineTo(x - size/12, y + size/8);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x + size/8, y + size/8);
                ctx.lineTo(x + size/10, y + size/5);
                ctx.lineTo(x + size/12, y + size/8);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'mago':
                // Sombrero de mago
                ctx.fillStyle = '#4B0082';
                ctx.beginPath();
                ctx.moveTo(x - size/2, y - size/2);
                ctx.lineTo(x + size/2, y - size/2);
                ctx.lineTo(x, y - size - 10);
                ctx.closePath();
                ctx.fill();
                
                // Ojos con aspecto sabio
                const magoEyeSize = size * 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(x - size/4, y - size/8, magoEyeSize, 0, Math.PI * 2);
                ctx.arc(x + size/4, y - size/8, magoEyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Brillos mágicos en los ojos
                ctx.fillStyle = '#4B0082';
                ctx.beginPath();
                ctx.arc(x - size/4 + magoEyeSize/2, y - size/8 - magoEyeSize/2, magoEyeSize/2, 0, Math.PI * 2);
                ctx.arc(x + size/4 + magoEyeSize/2, y - size/8 - magoEyeSize/2, magoEyeSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Barba
                ctx.fillStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.moveTo(x - size/6, y + size/8);
                ctx.lineTo(x + size/6, y + size/8);
                ctx.lineTo(x, y + size/2);
                ctx.closePath();
                ctx.fill();
                break;
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
        if (this.isTransitioning) return null;
        
        if (this.isPointInCircle(x, y, uiElements.leftArrow.x, uiElements.leftArrow.y, uiElements.leftArrow.radius)) {
            this.selectPreviousCharacter();
            return 'navigation';
        }
        
        if (this.isPointInCircle(x, y, uiElements.rightArrow.x, uiElements.rightArrow.y, uiElements.rightArrow.radius)) {
            this.selectNextCharacter();
            return 'navigation';
        }
        
        const selectBtn = uiElements.selectButton;
        if (x >= selectBtn.x && x <= selectBtn.x + selectBtn.width && 
            y >= selectBtn.y && y <= selectBtn.y + selectBtn.height) {
            return 'select';
        }
        
        return null;
    }
} 