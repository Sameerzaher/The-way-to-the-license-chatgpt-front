import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // עדכון state כך שה-UI הבא יציג את ה-fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // לוג השגיאה לקונסול ולשרת (אם נדרש)
    console.error('🚨 Error caught by ErrorBoundary:', error);
    console.error('📍 Error info:', errorInfo);
    
    // שמירת פרטי השגיאה ל-state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // שליחה לשירות לוגים (אם יש)
    if (process.env.NODE_ENV === 'production') {
      // כאן אפשר לשלוח לשירות כמו Sentry, LogRocket וכו'
      console.log('📤 Sending error to logging service...');
    }
  }

  handleReload = () => {
    // רענון הדף
    window.location.reload();
  };

  handleReset = () => {
    // איפוס ה-error boundary
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // UI מותאם אישית לשגיאה
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">אופס! משהו השתבש</h1>
            <p className="error-message">
              אירעה שגיאה בלתי צפויה באפליקציה. אנחנו מתנצלים על אי הנוחות.
            </p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="error-btn error-btn-primary"
              >
                🔄 נסה שוב
              </button>
              <button 
                onClick={this.handleReload}
                className="error-btn error-btn-secondary"
              >
                🏠 רענן דף
              </button>
            </div>

            {/* פרטי השגיאה (רק במצב פיתוח) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>פרטי השגיאה (מצב פיתוח)</summary>
                <div className="error-stack">
                  <h3>שגיאה:</h3>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h3>מיקום השגיאה:</h3>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-tips">
              <h3>💡 טיפים לפתרון:</h3>
              <ul>
                <li>נסה לרענן את הדף</li>
                <li>בדוק את החיבור לאינטרנט</li>
                <li>נסה לסגור ולפתוח מחדש את הדפדפן</li>
                <li>אם הבעיה נמשכת, צור קשר עם התמיכה</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // אם אין שגיאה, הצג את הילדים כרגיל
    return this.props.children;
  }
}

export default ErrorBoundary;
