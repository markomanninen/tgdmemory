#!/bin/bash

# TGD Memory - Quick Access Menu
# Usage: ./quick_access.sh

echo "🎛️  TGD Memory - Quick Access Menu"
echo "=================================="
echo ""
echo "1️⃣  Main Application:"
echo "   📱 App: http://localhost/src/pages/dirac_propagator/index.html"
echo "   🎛️  Dashboard: http://localhost:3001 (run ./setup_dashboard.sh first)"
echo ""
echo "2️⃣  Status & Monitoring:"
echo "   ./status_check.sh       - Quick system status"
echo "   ./monitor.sh           - Continuous monitoring"
echo "   ./performance_monitor.sh - Performance metrics"
echo ""
echo "3️⃣  Testing & Validation:"
echo "   ./test_production.sh   - Full production test"
echo "   ./validate_production.sh - Validate config"
echo "   ./test_auth.sh         - Test authentication"
echo "   ./test_equation_server.sh - Test API"
echo ""
echo "4️⃣  Management:"
echo "   ./clean_caches.sh      - Clean all caches"
echo "   ./backup.sh           - Database backup"
echo "   docker-compose ps     - Container status"
echo "   docker-compose logs   - View logs"
echo ""
echo "5️⃣  Deployment:"
echo "   ./deploy.sh           - Standard deploy"
echo "   ./deploy_production.sh - Production deploy"
echo ""

# Check if argument provided for direct access
case "$1" in
    "dashboard")
        echo "🚀 Starting monitoring dashboard..."
        ./setup_dashboard.sh
        ;;
    "status")
        echo "📊 Checking system status..."
        ./status_check.sh
        ;;
    "monitor")
        echo "👀 Starting continuous monitoring..."
        ./monitor.sh
        ;;
    "test")
        echo "🧪 Running production tests..."
        ./test_production.sh
        ;;
    "clean")
        echo "🧹 Cleaning caches..."
        ./clean_caches.sh
        ;;
    "logs")
        echo "📋 Showing application logs..."
        docker-compose logs app --tail=50 -f
        ;;
    "containers")
        echo "📦 Container status:"
        docker-compose ps
        ;;
    "web")
        echo "🌐 Opening web interfaces..."
        echo "📱 Main App: http://localhost/src/pages/dirac_propagator/index.html"
        if command -v open &> /dev/null; then
            open "http://localhost/src/pages/dirac_propagator/index.html"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost/src/pages/dirac_propagator/index.html"
        fi
        ;;
    *)
        echo "💡 Quick commands:"
        echo "   ./quick_access.sh dashboard  - Start monitoring dashboard"
        echo "   ./quick_access.sh status     - Check system status"
        echo "   ./quick_access.sh monitor    - Start monitoring"
        echo "   ./quick_access.sh test       - Run tests"
        echo "   ./quick_access.sh clean      - Clean caches"
        echo "   ./quick_access.sh logs       - View logs"
        echo "   ./quick_access.sh containers - Container status"
        echo "   ./quick_access.sh web        - Open web interfaces"
        ;;
esac
