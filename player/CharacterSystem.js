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
                create: (x, y) => new Player(x, y)
            },
            {
                id: 'tanque',
                name: 'Tanque',
                description: 'Alta vida y defensa, pero movimiento lento y menos daño.',
                previewColor: '#4682B4',
                create: (x, y) => new Tanque(x, y)
            },
            {
                id: 'asesino',
                name: 'Asesino',
                description: 'Alta velocidad y daño crítico, pero poca vida y defensa.',
                previewColor: '#8A2BE2',
                create: (x, y) => new Asesino(x, y)
            },
            {
                id: 'mago',
                name: 'Mago',
                description: 'Gran alcance y daño por proyectil, pero baja defensa y vida.',
                previewColor: '#FF7F50',
                create: (x, y) => new Mago(x, y)
            }
        ];
        
        this.selectedCharacterIndex = 0;
    }
    
    getSelectedCharacter() {
        return this.characters[this.selectedCharacterIndex];
    }
    
    createSelectedCharacter(x, y) {
        return this.getSelectedCharacter().create(x, y);
    }
    
    selectNextCharacter() {
        this.selectedCharacterIndex = (this.selectedCharacterIndex + 1) % this.characters.length;
    }
    
    selectPreviousCharacter() {
        this.selectedCharacterIndex = (this.selectedCharacterIndex - 1 + this.characters.length) % this.characters.length;
    }
    
    selectCharacterById(id) {
        const index = this.characters.findIndex(char => char.id === id);
        if (index !== -1) {
            this.selectedCharacterIndex = index;
            return true;
        }
        return false;
    }
    
    drawCharacterSelection(ctx, canvas) {
        // Fondo oscuro con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.save();
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SELECCIÓN DE PERSONAJE', canvas.width/2, canvas.height/6);
        ctx.restore();
        
        // Panel de personajes
        const panelWidth = canvas.width * 0.8;
        const panelHeight = canvas.height * 0.5;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = canvas.height/4;
        
        // Fondo del panel
        ctx.fillStyle = 'rgba(30, 30, 60, 0.7)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Personaje actual
        const currentChar = this.getSelectedCharacter();
        
        // Vista previa del personaje (cubo con el color correspondiente)
        const previewSize = 100;
        const previewX = panelX + panelWidth * 0.25;
        const previewY = panelY + panelHeight / 2;
        
        ctx.fillStyle = currentChar.previewColor;
        ctx.fillRect(previewX - previewSize/2, previewY - previewSize/2, previewSize, previewSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(previewX - previewSize/2, previewY - previewSize/2, previewSize, previewSize);
        
        // Nombre y descripción
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(currentChar.name, panelX + panelWidth * 0.4, panelY + panelHeight * 0.3);
        
        ctx.font = '18px Arial';
        ctx.fillText(currentChar.description, panelX + panelWidth * 0.4, panelY + panelHeight * 0.45);
        
        // Flechas de navegación
        this.drawNavigationArrow(ctx, panelX + 50, panelY + panelHeight/2, 'left');
        this.drawNavigationArrow(ctx, panelX + panelWidth - 50, panelY + panelHeight/2, 'right');
        
        // Botón de selección
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (canvas.width - buttonWidth) / 2;
        const buttonY = panelY + panelHeight + 50;
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SELECCIONAR', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
        
        // Indicador de navegación
        ctx.font = '16px Arial';
        ctx.fillText('< Anterior | Siguiente >', canvas.width/2, buttonY + buttonHeight + 30);
        
        return {
            leftArrow: { x: panelX + 50, y: panelY + panelHeight/2, radius: 25 },
            rightArrow: { x: panelX + panelWidth - 50, y: panelY + panelHeight/2, radius: 25 },
            selectButton: { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight }
        };
    }
    
    drawNavigationArrow(ctx, x, y, direction) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // Dibujar flecha
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (direction === 'left') {
            ctx.moveTo(x + 8, y);
            ctx.lineTo(x - 8, y);
            ctx.lineTo(x - 4, y - 8);
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x - 4, y + 8);
        } else {
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + 8, y);
            ctx.lineTo(x + 4, y - 8);
            ctx.moveTo(x + 8, y);
            ctx.lineTo(x + 4, y + 8);
        }
        ctx.stroke();
    }
    
    isPointInCircle(x, y, circleX, circleY, radius) {
        const dx = x - circleX;
        const dy = y - circleY;
        return dx * dx + dy * dy <= radius * radius;
    }
    
    handleCharacterSelectionClick(x, y, uiElements) {
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