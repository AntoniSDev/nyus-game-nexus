export function BuildVersion() {
  return (
    <span
      className="build-version"
      title={`Version ${__APP_VERSION__} · build ${__BUILD_ID__}`}
      aria-label={`Version ${__APP_VERSION__}, build ${__BUILD_ID__}`}
    >
      v{__APP_VERSION__} · {__BUILD_ID__}
    </span>
  );
}
