export class Dropdown {
    constructor(options) {
        this.id = options.id;
        this.buttonText = options.buttonText || '';
        this.buttonIcon = options.buttonIcon || '';
        this.items = options.items || [];
        this.onSelect = options.onSelect || (() => { });
        this.element = null;
    }

    render() {
        const dropdown = document.createElement('div');
        dropdown.className = 'relative inline-block text-left';
        dropdown.innerHTML = `
            <button type="button" class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 text-gray-500 hover:text-blue-500 cursor-pointer" id="${this.id}-button" aria-haspopup="true" aria-expanded="false">
                ${this.buttonIcon ? `<i class="${this.buttonIcon} mr-1"></i>` : ''}
                ${this.buttonText}
            </button>
            <div class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden" role="menu" aria-orientation="vertical" aria-labelledby="${this.id}-button" id="${this.id}-menu">
                <div class="py-1" role="none">
                    ${this.items.map((item, index) => `
                        <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" id="${this.id}-item-${index}">
                            ${item.icon ? `<i class="${item.icon} mr-2"></i>` : ''}${item.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.element = dropdown;
        this.attachEventListeners();
        return dropdown;
    }

    attachEventListeners() {
        const button = this.element.querySelector(`#${this.id}-button`);
        const menu = this.element.querySelector(`#${this.id}-menu`);

        button.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        this.items.forEach((item, index) => {
            const itemElement = this.element.querySelector(`#${this.id}-item-${index}`);
            itemElement.addEventListener('click', () => {
                this.onSelect(item, index);
                menu.classList.add('hidden');
            });
        });

        document.addEventListener('click', (event) => {
            if (!this.element.contains(event.target)) {
                menu.classList.add('hidden');
            }
        });
    }
}