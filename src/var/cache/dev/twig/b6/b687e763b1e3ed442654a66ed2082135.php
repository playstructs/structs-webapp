<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\CoreExtension;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;
use Twig\TemplateWrapper;

/* @WebProfiler/Icon/config.svg */
class __TwigTemplate_be28a9ee8906030361223647594319f4 extends Template
{
    private Source $source;
    /**
     * @var array<string, Template>
     */
    private array $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Icon/config.svg"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Icon/config.svg"));

        // line 1
        yield "<svg xmlns=\"http://www.w3.org/2000/svg\" data-icon-name=\"icon-tabler-adjustments\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" role=\"img\">
    <title>Config</title>
    <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"></path>
    <circle cx=\"6\" cy=\"10\" r=\"2\"></circle>
    <line x1=\"6\" y1=\"4\" x2=\"6\" y2=\"8\"></line>
    <line x1=\"6\" y1=\"12\" x2=\"6\" y2=\"20\"></line>
    <circle cx=\"12\" cy=\"16\" r=\"2\"></circle>
    <line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"14\"></line>
    <line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"20\"></line>
    <circle cx=\"18\" cy=\"7\" r=\"2\"></circle>
    <line x1=\"18\" y1=\"4\" x2=\"18\" y2=\"5\"></line>
    <line x1=\"18\" y1=\"9\" x2=\"18\" y2=\"20\"></line>
</svg>
";
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        yield from [];
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@WebProfiler/Icon/config.svg";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo(): array
    {
        return array (  48 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("<svg xmlns=\"http://www.w3.org/2000/svg\" data-icon-name=\"icon-tabler-adjustments\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" role=\"img\">
    <title>Config</title>
    <path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"></path>
    <circle cx=\"6\" cy=\"10\" r=\"2\"></circle>
    <line x1=\"6\" y1=\"4\" x2=\"6\" y2=\"8\"></line>
    <line x1=\"6\" y1=\"12\" x2=\"6\" y2=\"20\"></line>
    <circle cx=\"12\" cy=\"16\" r=\"2\"></circle>
    <line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"14\"></line>
    <line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"20\"></line>
    <circle cx=\"18\" cy=\"7\" r=\"2\"></circle>
    <line x1=\"18\" y1=\"4\" x2=\"18\" y2=\"5\"></line>
    <line x1=\"18\" y1=\"9\" x2=\"18\" y2=\"20\"></line>
</svg>
", "@WebProfiler/Icon/config.svg", "/src/vendor/symfony/web-profiler-bundle/Resources/views/Icon/config.svg");
    }
}
