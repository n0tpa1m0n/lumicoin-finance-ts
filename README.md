
# 💰 Lumincoin Finance

> Modern SPA for personal finance management built with TypeScript and professional architecture

## 🚀 Features

- Transaction Management - Track income and expenses with categorization
- Visual Analytics - Interactive charts using Chart.js
- Real-time Balance - Automatic balance updates
- Secure Auth - JWT authentication with refresh tokens
- Responsive Design - Mobile-first approach
- SPA Architecture - Fast, seamless navigation

## 🛠 Tech Stack

## Frontend:
- TypeScript
- Webpack 5
- SASS/SCSS
- Chart.js
- HTML5 Canvas

## Architecture:
- Component-based design
- Custom router with type safety
- Service layer abstraction
- Dynamic imports


## 💻 Installation

```bash
Clone repository
git clone https://github.com/n0tpa1m0n/lumincoin-finance.git
cd lumincoin-finance

Install dependencies
npm install

Development mode
npm run dev

Production build
npm run build
```

## 🎯 Technical Highlights

### Type-Safe Architecture
```typescript
// Strict typing throughout
export type Transaction = {
    id: string | number;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    comment: string;
};

// Type guards for runtime safety
private getInputElement(id: string): HTMLInputElement | null {
    const element = document.getElementById(id);
    return element instanceof HTMLInputElement ? element : null;
}
```

### Professional Patterns
- **Component reusability** - CardElement, HttpUtils, AuthUtils
- **Error handling** - Comprehensive exception management
- **Performance optimization** - Dynamic imports and code splitting
- **Security** - Protected routes and input validation

### Modern Development
- Full TypeScript implementation
- Custom SPA router with history API
- Responsive mobile design
- Interactive data visualization

## 🔧 Key Components

### Dashboard
- Real-time financial analytics
- Interactive pie charts for income/expense distribution
- Period filtering (day/week/month/year/custom)

### Transactions
- Complete CRUD operations
- Category-based organization
- Date range filtering

### Authentication
- JWT-based secure login/register
- Automatic token refresh
- Route protection

## 🚀 Why This Project Stands Out

This application demonstrates **production-ready development skills** with:

- **Enterprise-grade architecture** suitable for scaling
- **TypeScript mastery** throughout the codebase
- **Modern tooling** (Webpack 5, SASS, Chart.js)
- **User experience focus** (SPA, responsive, intuitive UI)
- **Security considerations** (auth, validation, error handling)

## 📈 Future Enhancements

- [ ] PWA support for offline functionality
- [ ] Budget planning features
- [ ] Multi-currency support
- [ ] Data export capabilities
- [ ] Advanced reporting

---


