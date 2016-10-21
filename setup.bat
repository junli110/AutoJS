reg add "HKEY_CLASSES_ROOT\*\shell\CompressJSDebug\command" /d "%cd%\CompressJSDebug.bat %%1"   /f
reg add "HKEY_CLASSES_ROOT\*\shell\CompressJSRelease\command"   /d "%cd%\CompressJSRelease.bat  %%1"   /f

echo echo %%1%%> CompressJSDebug.bat
echo node %cd%/AutoJS.js %%1%% debug>> CompressJSDebug.bat
echo pause>> CompressJSDebug.bat


echo echo %%1%%> CompressJSRelease.bat
echo node %cd%/AutoJS.js %%1%% release>> CompressJSRelease.bat
echo pause>> CompressJSRelease.bat

echo install successed
pause