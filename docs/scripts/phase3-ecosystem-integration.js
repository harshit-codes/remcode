                        console.log('✅ All ecosystem components integrated');
                        console.log('📊 Enhanced analytics engine operational');
                        console.log('🌐 Interactive dashboard created');
                        console.log('📚 Documentation updated');
                        console.log('🔧 GitHub Actions workflows enhanced');
                        console.log('\n🚀 Next Steps:');
                        console.log('  1. Open dashboard/index.html to view interactive dashboard');
                        console.log('  2. Run "npm run enhanced:analytics" for advanced insights');
                        console.log('  3. Use "npm run realtime:monitor" for live monitoring');
                        console.log('  4. Try "npm run enhanced:create" for better session creation');
                        process.exit(0);
                    } else {
                        console.log('❌ Phase 3 integration failed');
                        process.exit(1);
                    }
                })
                .catch(err => {
                    console.error('❌ Phase 3 integration error:', err);
                    process.exit(1);
                });
            break;
        
        case 'validate':
            integrator.validateEcosystemIntegration()
                .then(valid => {
                    if (valid) {
                        console.log('✅ Ecosystem validation passed');
                        process.exit(0);
                    } else {
                        console.log('❌ Ecosystem validation failed');
                        process.exit(1);
                    }
                })
                .catch(err => {
                    console.error('❌ Validation error:', err);
                    process.exit(1);
                });
            break;
            
        default:
            console.log('Usage: node phase3-ecosystem-integration.js [execute|complete|validate]');
            console.log('  execute/complete - Run complete Phase 3 integration');
            console.log('  validate - Validate ecosystem integration');
    }
}

module.exports = Phase3EcosystemIntegrator;