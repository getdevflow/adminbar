<?php

declare(strict_types=1);

namespace Plugin\AdminBar;

use App\Infrastructure\Services\Plugin;
use App\Shared\Services\Registry;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Psr\SimpleCache\InvalidArgumentException;
use Qubus\EventDispatcher\ActionFilter\Action;
use Qubus\Exception\Exception;
use ReflectionException;

use function App\Shared\Helpers\cms_enqueue_css;
use function App\Shared\Helpers\cms_enqueue_js;
use function App\Shared\Helpers\is_user_logged_in;
use function App\Shared\Helpers\plugin_basename;
use function App\Shared\Helpers\plugin_dir_path;
use function App\Shared\Helpers\plugin_url;
use function dirname;
use function get_class;
use function Qubus\Security\Helpers\esc_html__;
use function Qubus\Security\Helpers\t__;

class AdminBarPlugin extends Plugin
{
    private bool $rendered = false;

    /**
     * @inheritDoc
     * @throws ReflectionException|Exception
     */
    public function meta(): array
    {
        $plugin = [
            'name' => esc_html__(string: 'AdminBar', domain: 'adminbar'),
            'id' => 'adminbar',
            'author' => 'Joshua Parker',
            'version' => '3.1.0',
            'description' => t__(msgid: 'Adds an admin bar to Devflow site.', domain: 'adminbar'),
            'basename' => plugin_basename(dirname(__FILE__)),
            'path' => plugin_dir_path(dirname(__FILE__)),
            'url' => plugin_url('', __CLASS__),
            'pluginUri' => 'https://github.com/getdevflow/adminbar',
            'authorUri' => 'https://nomadicjosh.com/',
            'className' => get_class($this),
        ];

        Registry::getInstance()->set('adminbar', $plugin);

        return $plugin;
    }

    /**
     * @inheritDoc
     * @throws ReflectionException
     */
    public function handle(): void
    {
        $action = Action::getInstance();

        // The backend has no body-open hook, so render the fixed toolbar in its footer.
        $action->addAction('cms_admin_head', [$this, 'enqueueCss'], 99);
        $action->addAction('cms_admin_body_open', [$this, 'render'], 1);
        $action->addAction('cms_admin_footer', [$this, 'enqueueJs'], 99);

        // Every conforming frontend theme exposes these three CMS lifecycle hooks.
        $action->addAction('cms_head', [$this, 'enqueueCss'], 99);
        $action->addAction('cms_body_open', [$this, 'render'], 1);
        $action->addAction('cms_footer', [$this, 'renderFallback'], 1);
        $action->addAction('cms_footer', [$this, 'enqueueJs'], 99);
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws NotFoundExceptionInterface
     * @throws ReflectionException
     */
    public function enqueueCss(): void
    {
        if (!is_user_logged_in()) {
            return;
        }

        cms_enqueue_css(
            config: 'plugin',
            asset: $this->url() . '/css/style.css',
            slug: $this->id()
        );
    }

    /**
     * @return void
     * @throws ContainerExceptionInterface
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws NotFoundExceptionInterface
     * @throws ReflectionException
     */
    public function enqueueJs(): void
    {
        if (!is_user_logged_in()) {
            return;
        }

        cms_enqueue_js(
            config: 'plugin',
            asset: $this->url() . '/js/adminbar.js',
            slug: $this->id()
        );
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws NotFoundExceptionInterface
     * @throws ReflectionException
     */
    public function render(bool $fallback = false): void
    {
        if ($this->rendered || !is_user_logged_in()) {
            return;
        }

        $this->rendered = true;
        echo $this->view->render(
            'plugin::AdminBar/view/index',
            ['plugin' => $this->meta(), 'fallback' => $fallback]
        );
    }

    /**
     * Supports older themes that have a footer hook but no body-open hook.
     *
     * @throws ContainerExceptionInterface
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws NotFoundExceptionInterface
     * @throws ReflectionException
     */
    public function renderFallback(): void
    {
        $this->render(fallback: true);
    }
}
